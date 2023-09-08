<template>
  <div class="logs-wrapper">
    <div v-for="(dayPuffs, date) in puffsByDay" :key="date" class="day-logs">
      <h3>
        {{ date }}
        <span v-if="differenceInCalendarDays(dayPuffs[0]?.timestamp, new Date()) < 0" class="small">
          {{ formatDistanceToNowStrict(new Date(dayPuffs[0]?.timestamp)) }} ago
        </span>
        <span v-else class="small">Today</span>
      </h3>

      <div>
        <PuffEntry
          v-for="puff in dayPuffs"
          :key="puff.timestamp"
          :puff="puff"
          :rerender-key="rerenderKey"
          @change-time="(data) => emit('changeTime', data)"
        ></PuffEntry>
        <div class="total">
          <p v-if="isTHCVisible" class="thc">THC 🤙 {{ getTHCOfPuffs(dayPuffs).toFixed(2) }} g</p>
          <p class="gr">{{ date }} 🤙 {{ getWeightOfPuffs(dayPuffs).toFixed(2) }} g</p>
        </div>
      </div>
    </div>
    <div v-if="!props.puffs?.length">Wow, such empty</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Puff } from '@/database/db'
import format from 'date-fns/format'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import { formatDistanceToNowStrict } from 'date-fns'
import PuffEntry from '@/components/PuffEntry.vue'
import { useLocalStorage } from '@/database/localStorage'
import { UsageTypesEnum } from '@/types/types'

const emit = defineEmits(['changeTime'])

const settings = useLocalStorage()

const isTHCVisible = computed(() => settings.isTHCVisible.value)
const percentTHC = computed(() => settings.percentTHC.value)

type PuffLogsProps = {
  puffs: Puff[]
  rerenderKey: string
}

const props: PuffLogsProps = withDefaults(defineProps<PuffLogsProps>(), {
  puffs: () => [] as Puff[],
  rerenderKey: () => ''
})

const puffsByDay = computed(() => {
  if (!props.puffs?.length) {
    return {} as Record<string, Puff[]>
  }

  return props.puffs.reduce(
    (acc, puff) => {
      const day = format(puff.timestamp, 'dd LLL')
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(puff)
      return acc
    },
    {} as Record<string, Puff[]>
  )
})

const getWeightOfPuffs = (dayPuffs: Puff[]) => {
  return dayPuffs.reduce((acc, puff) => acc + puff.weight, 0)
}

const getTHCOfPuffs = (dayPuffs: Puff[]) => {
  if (!isTHCVisible.value) {
    return 0
  }

  let total: number = 0

  dayPuffs.forEach((puff) => {
    if (puff.icon === UsageTypesEnum.joint) {
      total += puff.weight * (percentTHC.value / 100)
    } else if (puff.icon === UsageTypesEnum.bong) {
      total += puff.weight * (percentTHC.value / 100)
    } else if (puff.icon === UsageTypesEnum.bolt) {
      total += puff.weight * (percentTHC.value / 200)
    }
  })

  return total
}
</script>

<style scoped lang="scss">
.logs-wrapper {
  isolation: isolate;
  overflow-y: auto;
  height: 100%;
  width: clamp(400rem/16, 50%, 100% - 1rem);
  padding: 1rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.day-logs {
  display: flex;
  flex-direction: column;
}

h3 {
  font-size: 1.5rem;
  font-weight: 400;
  color: #85d62fff;
}

.total {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-content: flex-end;

  & p {
    flex: 1 1 0;
    text-align: end;
  }
}

.total p {
  margin: 0.1rem 0;
}

.small {
  font-size: 0.8rem;
}
</style>
