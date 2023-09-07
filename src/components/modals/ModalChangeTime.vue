<template>
  <div>
    <div class="flex with-gap">
      <el-input type="time" v-model="timeHM" @change="onTimeChange"/>

      <el-button size="large" @click="moveDayBy(-1)">-1 Day</el-button>
      <el-button size="large"  :disabled="isNextDayAfterToday" @click="moveDayBy(1)">+1 Day</el-button>
    </div>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  flex-wrap: wrap;
}

.with-gap {
  gap: 1rem;
}

.with-gap .flex button {
  padding: 0.5rem;
}
</style>

<script setup lang="ts">
import type {Puff} from "@/database/db";
import {computed, onMounted, ref} from "vue";
import format from "date-fns/format";
import getTime from "date-fns/getTime";
import endOfDay from "date-fns/endOfDay";
import startOfDay from "date-fns/startOfDay";
import parse from "date-fns/parse";
import {differenceInDays} from "date-fns";
import {db} from "@/database/db";

export type ModalProps = {puff: Puff}

const props: ModalProps = defineProps<ModalProps>()

const timeHM = ref('');
const selectedTimestamp = ref(0);

onMounted(() => {
  selectedTimestamp.value = props.puff.timestamp;
  timeHM.value = format(props.puff.timestamp, 'HH:mm') ?? '';
})

/**
 * Moves day by diff
 * @param diff
 */
const moveDayBy = (diff: -1 | 1) => {
  if (!confirm('Are you sure?')) {
    return;
  }

  const nextDay = new Date(selectedTimestamp.value);
  nextDay.setDate(nextDay.getDate() + diff);

  //check if next day is after today
  if (diff === 1 && isNextDayAfterToday.value) {
    return;
  }

  const destinationTime = diff < 0 ? endOfDay(nextDay) : startOfDay(nextDay);

  timeHM.value = format(destinationTime, 'HH:mm')

  selectedTimestamp.value = getTime(destinationTime);

  db.puffs.update(props.puff.id!, {
    timestamp: getTime(destinationTime),
  } as Partial<Puff>);
}


/**
 * When time is changed
 */
const onTimeChange = () => {
  const newTime = parse(timeHM.value, 'HH:mm', new Date(selectedTimestamp.value));

  selectedTimestamp.value = getTime(newTime);

  db.puffs.update(props.puff.id!, {
    timestamp: getTime(newTime),
  } as Partial<Puff>);
}

const isNextDayAfterToday = computed(() => {
  const timestamp = selectedTimestamp.value;
  const nextDay = new Date(timestamp);
  nextDay.setDate(nextDay.getDate() + 1);

  return differenceInDays(endOfDay(nextDay), endOfDay(new Date())) > 0
})

</script>
