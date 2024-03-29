<template>
  <div class="puff-entry">
    <p class="parameters">
      <span class="parameter">
        <span class="icon"
          ><font-awesome-icon icon="fa-solid fa-clock-four fix-left-position" fixedWidth
        /></span>
        <span
          class="editable"
          v-on-long-press.prevent="[
            () => emit('changeTime', puff),
            { delay: 420, modifiers: { stop: true } }
          ]"
          >{{ format(puff.timestamp, 'HH:mm') }}</span
        >
      </span>
      <span class="puff-actions">
        <el-button @click="removePuff(puff.id!)" class="remove-puff"
          ><font-awesome-icon :icon="`fa-solid fa-trash-alt`" fixedWidth
        /></el-button>
      </span>
    </p>
    <p v-if="isFormatDistanceToNowVisible(puff.timestamp)">
      <span class="icon"
        ><font-awesome-icon :icon="`fa-solid fa-hourglass-half`" fixedWidth
      /></span>
      <span :key="`${props.rerenderKey}.${puff.id}`"
        >{{ formatDistanceToNow(puff.timestamp) }} ago</span
      >
    </p>
    <p class="parameters">
      <span class="parameter">
        <span class="icon" :class="getIconStyleClasses(puff.icon)">
          <font-awesome-icon :icon="puff.icon" fixedWidth />
        </span>
        <span
          :data-id="puff.id"
          :data-weight="puff.weight.toFixed(1)"
          class="editable"
          v-on-long-press.prevent="[
            onChangeWeightLongPress,
            { delay: 420, modifiers: { stop: true } }
          ]"
        >
          {{ puff.weight.toFixed(1) }}&nbsp;g
        </span>
      </span>

      <span class="parameter" v-if="puff.icon === 'bolt'">
        <span
          :data-id="puff.id"
          :data-temperature="puff.temperature?.toFixed(1) || 0"
          class="editable"
          v-on-long-press.prevent="[
            onChangeTemperatureLongPress,
            { delay: 420, modifiers: { stop: true } }
          ]"
        >
          {{ Math.abs(puff.temperature || 0) }}°
        </span>
        <font-awesome-icon icon="fa-solid fa-temperature-half" />
      </span>
    </p>
    <p class="parameters justify-center" :class="{ 'flex-start': puff.note }">
      <span class="parameter">
        <span class="icon"><font-awesome-icon :icon="`fa-solid fa-note-sticky`" fixedWidth /></span>
        <span
          :data-id="puff.id"
          :data-note="puff.note"
          class="editable"
          v-on-long-press.prevent="[
            onChangeNoteLongPress,
            { delay: 420, modifiers: { stop: true } }
          ]"
        >
          <em>{{ puff.note || 'Add' }}</em>
        </span>
      </span>
    </p>
    <hr />
  </div>
</template>

<script setup lang="ts">
import { vOnLongPress } from '@vueuse/components'
import format from 'date-fns/format'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { db } from '@/database/db'
import type { Puff } from '@/database/db'
import { UsageTypesEnum } from '@/types/types'
import { compareAsc, startOfToday } from 'date-fns'

const emit = defineEmits(['changeTime'])

type PuffEntryProps = {
  puff: Puff
  rerenderKey: string
}

const props = defineProps<PuffEntryProps>()

/**
 * Checks if time is of current day
 * We hide distance to now for puffs older than today
 * @param timestamp
 */
const isFormatDistanceToNowVisible = (timestamp: number) => {
  // startOfToday() <= timestamp
  return compareAsc(startOfToday(), new Date(timestamp)) <= 0
}

const removePuff = (id: number) => {
  if (confirm('Delete this puff?')) {
    db.puffs.delete(id)
  }
}

const onChangeNoteLongPress = (e: PointerEvent) => {
  const target = (e.target as HTMLElement).parentElement

  if (!(target instanceof HTMLElement)) {
    alert('Something went wrong :(')
    return
  }

  const puffNote = target.getAttribute('data-note') || ''

  let newNote = prompt('New note?', puffNote) ?? ''

  const puffId = target.getAttribute('data-id')

  db.puffs.update(+puffId!, { note: newNote.trim() })
}

const onChangeTemperatureLongPress = (e: PointerEvent) => {
  const target = e.target as HTMLElement

  if (!(target instanceof HTMLElement)) {
    alert('Something went wrong :(')
    return
  }

  const puffTemperature = parseInt(target.getAttribute('data-temperature') || '0')

  const newTemperature = prompt('New temperature?', puffTemperature.toString())

  if (newTemperature) {
    const puffId = target.getAttribute('data-id')
    if (puffId) {
      localStorage.setItem('temperature', newTemperature)
      db.puffs.update(+puffId, { temperature: +newTemperature })
    }
  }
}

const onChangeWeightLongPress = (e: PointerEvent) => {
  const target = e.target as HTMLElement

  if (!(target instanceof HTMLElement)) {
    alert('Something went wrong :(')
    return
  }

  const puffWeight = target.getAttribute('data-weight') || '0'

  const newWeight = prompt('New weight?', puffWeight)

  if (newWeight) {
    const puffId = target.getAttribute('data-id')
    if (puffId) {
      db.puffs.update(+puffId, { weight: +newWeight })
    }
  }
}

const getIconStyleClasses = (icon?: UsageTypesEnum): string => {
  // fix positioning of icon for bong
  return icon === UsageTypesEnum.bong ? `fix-left-position` : ''
}
</script>

<style lang="scss" scoped>
.puff-entry {
  & p {
    font-family: monospace;
    font-size: 1rem;

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
  }

  & p:first-child {
    font-size: 1rem;
    font-weight: 700;
  }

  & p:last-child {
    font-size: 0.8rem;
    font-weight: 400;
  }

  & hr {
    margin: 0.25rem 0.25rem 0.25rem 0.25rem;
    border: 0;
    height: 1px;
    background: #85d62fff;
    background-image: linear-gradient(to right, #85d62fff, #2fd632fc, #2fd690);
  }

  & .total {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;

    & p {
      margin: 0.5rem 0;
    }
  }

  & .puff-actions {
    display: flex;
    justify-content: flex-end;
  }

  & .remove-puff {
    cursor: pointer;
    outline: none;

    color: inherit;
    border-radius: 0.5rem;
    border-width: 1px;
    border-style: solid;
    border-color: hsl(1deg 62% 42% / 0.84);

    background: hsl(1deg 72% 42% / 0.42);

    opacity: 0.85;
  }

  & .icon {
    min-width: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  & .fix-left-position {
    position: relative;
    left: 1px;
  }

  & .editable {
    cursor: pointer;
    line-height: 1.5rem;
    text-decoration: underline;
    text-decoration-color: #2fd690ff;
    text-decoration-thickness: 1px;
    text-decoration-style: dashed;
    text-underline-offset: 0.15rem;
  }

  & .parameter {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  & p.parameters {
    gap: 2rem;
    justify-content: space-between;
  }

  & .parameters.justify-center {
    justify-content: center;
    flex-wrap: nowrap;
  }

  & .parameters.justify-center.flex-start {
    justify-content: flex-start;
  }

  & .parameters.justify-center .parameter {
    flex-wrap: nowrap;
  }
}
</style>
