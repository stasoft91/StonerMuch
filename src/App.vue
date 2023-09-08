<script setup lang="ts">
import { db } from '@/database/db'
import type { Settings } from '@/database/db'
import type { Puff } from '@/database/db'
import getTime from 'date-fns/getTime'
import subDays from 'date-fns/subDays'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'
import { useObservable } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import type { Ref } from 'vue'
import { h } from 'vue'
import PuffLogs from '@/components/PuffLogs.vue'
import ModalHelp from '@/components/modals/ModalHelp.vue'
import ActionButton from '@/components/ActionButton.vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { exportDB, importInto } from 'dexie-export-import'
import { DEFAULT_SETTINGS, VERSION } from '@/constants/constants'
import { vOnLongPress } from '@vueuse/components'
import { UsageTypesEnum } from '@/types/types'

import { ElMessage, ElMessageBox } from 'element-plus'
import type { Action } from 'element-plus'
import ModalChangeTime from '@/components/modals/ModalChangeTime.vue'
import ModalSettings from '@/components/modals/ModalSettings.vue'

let intervalRefreshAllTimeValues: number

const rerenderId = ref(Math.random().toString(36).substring(3))

onMounted(async () => {
  clearInterval(intervalRefreshAllTimeValues)
  intervalRefreshAllTimeValues = setInterval(() => {
    // update the time every minute
    rerenderId.value = Math.random().toString(36).substring(3)
  }, 1000 * 60)

  if ((await db.settings.count()) === 0) {
    onShowModalPress()

    await db.settings.add({
      id: 1,
      jointWeight: parseFloat(DEFAULT_SETTINGS.jointWeight),
      boltWeight: parseFloat(DEFAULT_SETTINGS.boltWeight),
      bongWeight: parseFloat(DEFAULT_SETTINGS.bongWeight)
    })

    localStorage.setItem('temperature', '175')
  }
})

onUnmounted(() => clearInterval(intervalRefreshAllTimeValues))

const settings = useObservable(liveQuery(() => db.settings.toArray()) as any) as Ref<Settings[]>

const computedSettings = computed(() => {
  if (settings && settings?.value && settings.value[0]) {
    return settings.value[0]
  } else return { jointWeight: 0, boltWeight: 0, bongWeight: 0, lastExport: undefined }
})

const puffsSorted = useObservable(
  liveQuery(() =>
    db.puffs
      .where('timestamp')
      .between(getTime(subDays(startOfDay(new Date()), 7)), getTime(endOfDay(new Date())))
      .reverse()
      .sortBy('timestamp')
  ) as any
) as Ref<Puff[]>

const onClearDataBtnClick = async () => {
  if (confirm('Are you sure?')) {
    await db.puffs.clear()
    await db.settings.clear()
    localStorage.clear()
    window.location.reload()
  }
}

const onExportDataBtnClick = async () => {
  await db.settings.update(1, { lastExport: getTime(new Date()) })

  const blob = await exportDB(db, { prettyJson: true })

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(await blob.text())
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute('href', dataStr)
  downloadAnchorNode.setAttribute('download', 'stoner_much.' + getTime(new Date()) + '.json')
  document.body.appendChild(downloadAnchorNode) // required for firefox
  downloadAnchorNode.click()
  downloadAnchorNode.remove()

  ElMessage({
    type: 'success',
    message: `Export success!`
  })
}

const onImportDataBtnClick = async () => {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'

  fileInput.onchange = async () => {
    if (fileInput?.files && fileInput.files.length > 0) {
      const file = fileInput?.files[0]

      const backup = await exportDB(db, { prettyJson: true })

      //latest puff
      const lastPuff = await db.puffs.orderBy('timestamp').last()
      const lastTimestamp = lastPuff?.timestamp || 0

      try {
        // throws here if it was not json
        const isJson = JSON.parse(await file.text())

        if (file && isJson) {
          await importInto(db, file, { clearTablesBeforeImport: true })

          const newLastPuff = await db.puffs.orderBy('timestamp').last()

          // if latest puff in newly exported db is older than the latest puff in the old db
          if (newLastPuff?.timestamp && newLastPuff.timestamp < lastTimestamp) {
            // if user wants to overwrite
            if (confirm('Newer data already exists! Do you want to overwrite it?')) {
              return
            } else {
              throw new Error('Newer data already exists!')
            }
          }
        }

        ElMessage({
          type: 'success',
          message: `Import success!`
        })
      } catch (e) {
        await importInto(db, backup, { clearTablesBeforeImport: true })

        console.error(e)
        ElMessage({
          type: 'error',
          message: `Import failed!\n${e}`
        })
      }
    }
  }

  fileInput.click()
}

const unsavedItemsCount = computed(() => {
  if (computedSettings.value.lastExport) {
    return (
      puffsSorted.value?.filter((puff) => puff.timestamp > (computedSettings.value.lastExport || 0))
        .length || 0
    )
  } else return 0
})

const onShowModalPress = () => {
  ElMessageBox.alert(h(ModalHelp), "What's that?", {
    // if you want to disable its autofocus
    // autofocus: false,
    confirmButtonText: 'Cool',
    cancelButtonText: 'Setings',
    showCancelButton: true,
    distinguishCancelAndClose: true,
    // showClose: false,

    callback: (action: Action) => {
      if (action === 'cancel') {
        showSettingsModal()
      }
    }
  })
}

const showSettingsModal = () => {
  ElMessageBox.alert(h(ModalSettings), 'Settings', {
    confirmButtonText: 'Cool'
  })
}

const originalTimestamp = ref(0)

const openChangeTimeDialog = (puff: Puff) => {
  originalTimestamp.value = puff.timestamp || 0

  ElMessageBox.alert(h(ModalChangeTime, { puff }), 'Time', {
    confirmButtonText: 'Save',
    cancelButtonText: 'Cancel',
    showCancelButton: true,

    callback: async (action: Action) => {
      if (action !== 'confirm') {
        await db.puffs.update(puff.id!, {
          timestamp: getTime(originalTimestamp.value)
        } as Partial<Puff>)
      }
    }
  })
}
</script>

<template>
  <div class="wrapper">
    <div class="settings-wrapper">
      <el-button style="border-color: #2ed6d0f9" @click="onExportDataBtnClick"
        >Export{{ unsavedItemsCount ? ` (+${unsavedItemsCount})` : '' }}</el-button
      >
      <el-button style="border-color: #d6d32ef9" @click="onImportDataBtnClick">Import</el-button>
      <el-button style="border-color: #d62f75cd" @click="onClearDataBtnClick">Clear</el-button>
    </div>
    <header>
      <h1 v-on-long-press.prevent="[onShowModalPress, { delay: 420, modifiers: { stop: true } }]">
        Stoner much <span class="micro-text-version">{{ VERSION }}</span>
      </h1>
    </header>

    <main>
      <div class="button-wrapper">
        <ActionButton
          :icon="UsageTypesEnum.joint"
          :weight="computedSettings.jointWeight"
        ></ActionButton>
        <ActionButton
          :icon="UsageTypesEnum.bolt"
          :weight="computedSettings.boltWeight"
        ></ActionButton>
        <ActionButton
          :icon="UsageTypesEnum.bong"
          :weight="computedSettings.bongWeight"
        ></ActionButton>
      </div>
      <div class="flex">
        <PuffLogs
          class="puff-logs"
          :puffs="puffsSorted"
          :rerenderKey="rerenderId"
          @change-time="openChangeTimeDialog"
        />
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
header {
  --underline-deg: 0deg;
  --box-shadow-deg1: 62deg;
  --box-shadow-deg2: 89deg;

  margin-top: 0.5rem;
  margin-bottom: 0.5rem;

  text-decoration: dashed;
  text-decoration-thickness: 1px;
  text-decoration-line: underline;
  text-underline-offset: 0.25rem;

  -moz-animation: main-animation 4.2s 0s infinite;
  -webkit-animation: main-animation 4.2s 0s infinite;
  -o-animation: main-animation 4.2s 0s infinite;
  animation: main-animation 4.2s 0s infinite;
}

.wrapper {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto 1fr;
  align-items: start;
  justify-items: center;
  align-content: space-between;
  overflow-y: auto;
  overflow-x: hidden;

  & > * {
    max-width: 1280px;
  }
}

h1 {
  font-size: 2rem;
  font-weight: 400;
  position: relative;
  text-transform: capitalize;
  cursor: pointer;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  height: 100%;
}

.btn-reset,
.btn-export,
.btn-import {
  //background-color: hsl(0, 0%, 100%);
  border: 2px solid #d62f75cd;
  border-radius: 5px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-export {
  border: 2px solid #2ed6d0f9;
}

.btn-import {
  border: 2px solid #d6d32ef9;
}
//
//button {
//  display: flex;
//  align-items: center;
//  justify-content: space-between;
//  flex-direction: column;
//}

.flex {
  margin-top: 2rem;

  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  flex-wrap: wrap;
  width: 100vw;
  max-width: 1280px;
  overflow: hidden;
  height: 100%;
}

.button-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100vw;
  max-width: 1280px;
  gap: 0.25rem;

  margin: 0.25rem 0;
}

.settings-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;

  place-items: center;

  width: 100vw;
  max-width: 720px;

  padding: 0.25rem 0.5rem 0;

  opacity: 0.5;

  & button {
    padding: 0.25rem 1rem;
    color: white;
    font-size: 1rem;
  }
}

.micro-text-version {
  font-size: 0.5rem;
  opacity: 0.5;

  top: 0.5rem;
  right: -1rem;

  position: absolute;
}

@keyframes main-animation {
  @for $i from 0 through 100 {
    #{$i * 1%} {
      text-decoration-color: hsl($i * 3.6deg 100% 75% / 42%);
      text-shadow:
        -1px -1px 6px hsl($i * 3.6deg+62deg 67% 51% / 0.6),
        2px 2px 8px hsl($i * 3.6deg+89deg 67% 51% / 0.6);
    }
  }
}
</style>
