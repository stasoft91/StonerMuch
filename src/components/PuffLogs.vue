<template>
  <div class="logs-wrapper">
    <div v-for="(dayPuffs, date) in puffsByDay" :key="date" class="day-logs">
      <h3>{{ date }}</h3>

      <div>
        <div v-for="puff in dayPuffs" :key="puff.timestamp" class="puff-entry">
          <p class="parameters">
            <span class="parameter">
              <span class="icon">🕠</span>
              <span>{{ format(puff.timestamp, 'HH:mm') }}</span>
            </span>
            <span class="puff-actions">
              <button @click="removePuff(puff.id!)" class="remove-puff"><font-awesome-icon :icon="`fa-solid fa-trash-alt`" fixedWidth /></button>
            </span>
          </p>
          <p>
            <span class="icon"><font-awesome-icon :icon="`fa-solid fa-hourglass-half`" fixedWidth /></span>
            <span>{{ formatDistanceToNow(puff.timestamp) }} ago</span>
          </p>
          <p class="parameters">
            <span class="parameter">
              <span v-if="puff.icon" class="icon">
                <font-awesome-icon :icon="`fa-solid fa-${puff.icon}`" fixedWidth />
              </span>
              <span v-if="!puff.icon" class="icon">⚖️</span>
              <span
                  :data-id="puff.id"
                  :data-weight="puff.weight.toFixed(1)"
                  class="editable"
                  v-on-long-press.prevent="[onChangeWeightLongPress, {delay: 420, modifiers: { stop: true }}]"
              >
                {{ puff.weight.toFixed(1) }}<span>&nbsp;g</span>
              </span>
            </span>

            <span class="parameter" v-if="puff.icon === 'bolt'">
              <span
                  :data-id="puff.id"
                  :data-temperature="puff.temperature?.toFixed(1) || 0"
                  class="editable"
                  v-on-long-press.prevent="[onChangeTemperatureLongPress, {delay: 420, modifiers: { stop: true }}]"
              >
                {{ Math.abs(puff.temperature || 0) }}°
              </span>
              <font-awesome-icon :icon="`fa-solid fa-temperature-half`"/>
            </span>
          </p>
          <p class="parameters justify-center" :class="{'flex-start':puff.note}">
            <span class="parameter">
              <span class="icon"><font-awesome-icon :icon="`fa-solid fa-note-sticky`" fixedWidth/></span>

              <span
                  :data-id="puff.id"
                  :data-note="puff.note"
                  class="editable"
                  v-on-long-press.prevent="[onChangeNoteLongPress, {delay: 420, modifiers: { stop: true }}]"
              >
                <em>{{ puff.note || 'Add' }}</em>
              </span>
            </span>
          </p>
          <hr />
        </div>
        <div class="total">
          <p>{{ date }} 🤙 {{ dayPuffs.reduce((acc, puff) => acc + puff.weight, 0).toFixed(1) }} g</p>
        </div>
      </div>
    </div>
    <div v-if="!props.puffs?.length">Wow, such empty</div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type { Puff } from '@/database/db'
import format from 'date-fns/format'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import {db} from "@/database/db";
import { vOnLongPress } from '@vueuse/components'

type PuffLogsProps = {
  puffs: Puff[]
}

// @ts-ignore
const props: PuffLogsProps = withDefaults(defineProps<PuffLogsProps>(), {
  puffs: () => [] as Puff[],
})

const puffsByDay = computed(() => {
  if (!props.puffs?.length) {
    return {} as Record<string, Puff[]>
  }

  return props.puffs.reduce((acc, puff) => {
    const day = format(puff.timestamp, 'dd LLLL')
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(puff)
    return acc
  }, {} as Record<string, Puff[]>)
})

const removePuff = (id: number) => {
  if (confirm('Are you sure want to delete this puff?')) {
    db.puffs.delete(id)
  }
}

const onChangeNoteLongPress = (e: PointerEvent) => {
  const target = (e.target as HTMLElement).parentElement;

  if (!(target instanceof HTMLElement)) {
    alert ('Something went wrong :(')
    return
  }

  const puffNote = target.getAttribute('data-note') || ''

  let newNote = prompt('New note?', puffNote)

  const puffId = target.getAttribute('data-id')

  // if (newNote.trim().length > 10) {
  //   alert('Note is too long, truncating to 10 characters');
  //   newNote = newNote.trim().substring(0, 10);
  // }

  db.puffs.update(+puffId, { note: newNote.trim() })
}

const onChangeTemperatureLongPress = (e: PointerEvent) => {
  const target = e.target as HTMLElement;

  if (!(target instanceof HTMLElement)) {
    alert ('Something went wrong :(')
    return
  }

  const puffTemperature = parseInt(target.getAttribute('data-temperature'))

  const newTemperature = prompt('New temperature?', puffTemperature.toString())

  if (newTemperature) {
    const puffId = target.getAttribute('data-id')
    if (puffId) {
      localStorage.setItem('temperature', newTemperature);
      db.puffs.update(+puffId, { temperature: +newTemperature })
    }
  }
}

const onChangeWeightLongPress = (e: PointerEvent) => {
  const target = e.target as HTMLElement;

  if (!(target instanceof HTMLElement)) {
    alert ('Something went wrong :(')
    return
  }

  const puffWeight = target.getAttribute('data-weight')

  const newWeight = prompt('New weight?', puffWeight)

  if (newWeight) {
    const puffId = target.getAttribute('data-id')
    if (puffId) {
      db.puffs.update(+puffId, { weight: +newWeight })
    }
  }
}
</script>

<style scoped lang="scss">
.logs-wrapper {
  isolation: isolate;
  overflow-y: auto;
  height: 100%;
  width: clamp(400rem/16, 50%, 100% - 1rem);

}

.day-logs {
  display: flex;
  flex-direction: column;
}

h3 {
  font-size: 1.5rem;
  font-weight: 400;
  color: #85d62fff;
  margin-left: 1rem;
}

.puff-entry {
  margin: 1rem 0;
}

.puff-entry p {
  font-family: monospace;
  font-size: 1rem;

  margin: 0 1rem;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
}

.puff-entry p:first-child {
  font-size: 1rem;
  font-weight: 700;
}

.puff-entry p:last-child {
  font-size: 0.8rem;
  font-weight: 400;
}

.puff-entry hr {
  margin: 0.25rem 0.25rem 0.25rem 0.25rem;
  border: 0;
  height: 1px;
  background: #85d62fff;
  background-image: linear-gradient(to right, #85d62fff, #2fd632fc, #2fd690);
}

.total {
  display: flex;
  justify-content: flex-end;
  margin-right: 1rem;
  margin-bottom: 1rem;
}

.total p {
  margin: 0.5rem 0;
}

.puff-actions {
  display: flex;
  justify-content: flex-end;
}

.remove-puff {
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

.icon {
  min-width: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.editable {
  cursor: pointer;
  line-height: 1.5rem;
  text-decoration: underline;
  text-decoration-color: #2fd690ff;
  text-decoration-thickness: 1px;
  text-decoration-style: dashed;
  text-underline-offset: 0.15rem;
}

.parameter {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

p.parameters {
  gap: 2rem;
  justify-content: space-between;
}

.parameters.justify-center {
  justify-content: center;
  flex-wrap: nowrap;
}

.parameters.justify-center.flex-start {
  justify-content: flex-start;
}

.parameters.justify-center .parameter {
  flex-wrap: nowrap;
}
</style>
