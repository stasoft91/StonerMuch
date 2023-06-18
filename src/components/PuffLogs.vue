<template>
  <div class="logs-wrapper">
    <div v-for="(dayPuffs, date) in puffsByDay" :key="date" class="day-logs">
      <h3>{{ date }}</h3>

      <div>
        <div v-for="puff in dayPuffs" :key="puff.timestamp" class="puff-entry">
          <div class="puff-actions">
            <button @click="removePuff(puff.id)" class="remove-puff"><font-awesome-icon :icon="`fa-solid fa-trash-alt`" fixedWidth /></button>
          </div>
          <p>
            <span class="icon">🕠</span>
            <span>{{ format(puff.timestamp, 'HH:mm') }}</span>
          </p>
          <p>
            <span class="icon">⌛</span>
            <span>{{ formatDistanceToNow(puff.timestamp) }} ago</span>
          </p>
          <p>
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
              {{ puff.weight.toFixed(1) }}
              <span>g</span>
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

const props: PuffLogsProps = withDefaults(defineProps<PuffLogsProps>(), {
  puffs: () => [] as Puff[],
})

const puffsByDay = computed(() => {
  if (!props.puffs?.length) {
    return {}
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
  if (confirm('Are you sure?')) {
    db.puffs.delete(id)
  }
}

const onChangeWeightLongPress = (e: PointerEvent) => {
  const puffWeight = e.target?.getAttribute('data-weight')

  const newWeight = prompt('New weight?', puffWeight)

  if (newWeight) {
    const puffId = e.target?.getAttribute('data-id')
    if (puffId) {
      db.puffs.update(+puffId, { weight: +newWeight })
    }
  }
}
</script>

<style scoped>
.logs-wrapper {
  isolation: isolate;
  overflow-y: auto;
  height: 100%;
  width: calc(300rem / 16);
}

.day-logs {
  display: flex;
  flex-direction: column;
}

h3 {
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 1rem;
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
  margin: 0.25rem 1.25rem 0.25rem 0.5rem;
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
  height: 0;
}

.remove-puff {
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 1rem;
  cursor: pointer;
  outline: none;

  padding: 0.25rem;

  color: #D62F75CD;
}

.icon {
  width: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.editable {
  cursor: pointer;
  line-height: 1.5rem;
  text-decoration: underline;
  text-decoration-color: #2fd69099;
  text-decoration-thickness: 1px;
  text-decoration-style: dashed;
  text-underline-offset: 0.15rem;
}
</style>
