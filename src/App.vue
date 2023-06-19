<script setup lang="ts">
import {db, Settings} from '@/database/db'
import type { Puff } from '@/database/db'
import getTime from 'date-fns/getTime'
import subDays from 'date-fns/subDays'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'
import { useObservable } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import type { Ref } from 'vue'
import PuffLogs from '@/components/PuffLogs.vue'
import ModalHelp from '@/components/ModalHelp.vue'
import ActionButton from '@/components/ActionButton.vue'
import {computed, onMounted, onUnmounted, ref} from "vue";
import {exportDB, importInto} from "dexie-export-import";
import {VERSION} from "@/constants/constants";
import { vOnLongPress } from '@vueuse/components'

let intervalId :number;

const rerenderId = ref(Math.random().toString(36).substring(3))

onMounted(() => {
  clearInterval(intervalId)
  intervalId = setInterval(() => {
    // update the time every second
    rerenderId.value = Math.random().toString(36).substring(3)
  }, 1000 * 60)
})

onUnmounted(() => clearInterval(intervalId))

const isModalOpen = ref(false);

const settings = useObservable(liveQuery(() => db.settings.toArray()) as any) as Ref<
    Settings[]
>

const computedSettings = computed(() => {
  if (settings && settings?.value && settings.value[0]) {
    return settings.value[0];
  } else return { jointWeight: 0, boltWeight: 0, bongWeight: 0, lastExport: undefined };
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

const onClearDataBtnClick = () => {
  if (confirm('Are you sure?')) {
    db.puffs.clear()
    db.settings.clear()
  }
}

const onExportDataBtnClick = async () => {
  await db.settings.update(1, {lastExport: getTime(new Date())})

  const blob = await exportDB(db, {prettyJson: true});

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent((await blob.text()));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", 'stoner_much.'+ getTime(new Date()) + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

const onImportDataBtnClick = async () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.onchange = async () => {
    if (fileInput?.files && fileInput.files.length > 0) {
      const file = fileInput?.files[0];
      await importInto(db, file);
    }
  };
  fileInput.click();
}

const unsavedItemsCount = computed(() => {
  if (computedSettings.value.lastExport) {
    return puffsSorted.value.filter(puff => puff.timestamp > computedSettings.value.lastExport).length;
  } else return 0;
})

const onShowModalPress = () => {
  isModalOpen.value = true;
}
</script>

<template>
  <div class="settings-wrapper">
    <button class="btn-export" @click="onExportDataBtnClick">Export Data{{unsavedItemsCount ? ` (+${unsavedItemsCount})` : ''}}</button>
    <button class="btn-import" @click="onImportDataBtnClick">Import Data</button>
    <button class="btn-reset" @click="onClearDataBtnClick">Clear Data</button>
  </div>
  <header>
    <h1 v-on-long-press.prevent="[onShowModalPress, {delay: 420, modifiers: { stop: true }}]">Stoner much <span class="micro-text-version">{{ VERSION }}</span></h1>
  </header>

  <main>
    <div class="button-wrapper">
      <ActionButton :icon="'joint'" :weight="computedSettings.jointWeight"></ActionButton>
      <ActionButton :icon="'bolt'" :weight="computedSettings.boltWeight"></ActionButton>
      <ActionButton :icon="'bong'" :weight="computedSettings.bongWeight"></ActionButton>
    </div>
    <div class="flex">
      <PuffLogs class="puff-logs" :puffs="puffsSorted" :key="rerenderId" />
    </div>
  </main>

  <div v-if="isModalOpen" class="overlay">
    <ModalHelp @close-modal="isModalOpen = false"></ModalHelp>
  </div>
</template>

<style scoped lang="scss">
header {
  --underline-deg: 0deg;
  --box-shadow-deg1: 62deg;
  --box-shadow-deg2: 89deg;

  margin-top: 2rem;
  margin-bottom: 2rem;

  text-decoration: dashed;
  text-decoration-thickness: 1px;
  text-decoration-line: underline;
  text-underline-offset: 0.25rem;

  -moz-animation: main-animation 4.2s 0s infinite;
  -webkit-animation: main-animation 4.2s 0s infinite;
  -o-animation: main-animation 4.2s 0s infinite;
  animation: main-animation 4.2s 0s infinite;
}

h1 {
  font-size: 2rem;
  font-weight: 400;
  position: relative;
  text-transform: capitalize;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
}

.btn-reset, .btn-export, .btn-import {
  padding: 0.25rem 0.5rem;

  background-color: hsl(0, 0%, 100%);
  border: 2px solid #D62F75CD;
  border-radius: 5px;
  font-size: 0.75rem;
  cursor: pointer;
}

.btn-export {
 border: 2px solid #2ED6D0F9;
}

.btn-import {
 border: 2px solid #D6D32EF9;
}

button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
}

.flex {
  margin-top: 2rem;

  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  flex-wrap: wrap;
  width: 100vw;
  overflow: hidden;
}

.button-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100vw;
  gap: 0.25rem;

  margin: 0.25rem 0;
}

.settings-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100vw;

  padding: 0.25rem 0.50rem 0;

  position: absolute;
  top: 0;

  opacity: 0.5;
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
      text-decoration-color: hsl($i*3.6deg 100% 75% / 42%);
      text-shadow:
          -1px -1px 6px hsl($i*3.6deg+62deg 67% 51% / 0.6),
          2px 2px 8px hsl($i*3.6deg+89deg 67% 51% / 0.6);
    }
  }
}
</style>
