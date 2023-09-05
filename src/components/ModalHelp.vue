<template>
  <div class="modal">
    <div v-if="'help' === props.type" class="modal-content">
      <button class="btn-close" @click="emitCloseModal"> X </button>

      <h2>Hello!</h2>

      <p>Thanks for using Stoner Much!</p>
      <p>It's a simple app to track your smoking habits.</p>
      <p>It's completely free and open source.</p>
      <p>Feel free to contribute on <a href="https://github.com/stasoft91/StonerMuch">GitHub</a>.</p>

      <h3>How to use</h3>
      <ul>
        <li>Press <ActionButton class="miniature" is-demo-mode :icon="demoPuffIcon" :weight="0"/> to add a puff</li>
        <li>Press and hold <ActionButton class="miniature" is-demo-mode :icon="demoPuffIcon" :weight="0" /> to edit bowl size</li>

        <li>Press <span class="trash-icon"><font-awesome-icon :icon="`fa-solid fa-trash-alt`" fixedWidth /></span> to remove a puff</li>
        <li>Press and hold on <span class="editable">puff`s weight</span> to change it</li>
        <li>Press and hold on the <span class="editable">header</span> to open this help</li>
        <li>Press and hold on the <span class="editable">anything with this underline</span> to activate different actions</li>
        <li>It`s never too late for a backup!</li>

      </ul>
      <h4>Enjoy!</h4>
    </div>

    <div v-if="'changeTime' === props.type" class="modal-content with-gap">
      <button class="btn-close" @click="emitCloseModal"> X </button>

      <h2>Change time</h2>

      <input type="time" v-model="timeHM" @change="onTimeChange"/>
      <button v-if="isRevertAvailable" @click="onRevertTime">Revert</button>
      <div class="flex with-gap">
        <button @click="moveDayBy(-1)">-1 Day</button>
        <button :disabled="isNextDayAfterToday" @click="moveDayBy(1)">+1 Day</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionButton from './ActionButton.vue'
import {computed, onMounted, onUnmounted, ref} from "vue";
import type {Ref} from "vue";
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import getTime from 'date-fns/getTime'

import type {Puff} from "@/database/db";
import {UsageTypesEnum} from "@/types/types";
import endOfDay from "date-fns/endOfDay";
import {differenceInDays} from "date-fns";
import startOfDay from "date-fns/startOfDay";
const emit = defineEmits(['close-modal', 'change-time'])

type ModalProps = {
  type: 'help' | 'changeTime';
  puff?: Puff;
}

const props: ModalProps = withDefaults(defineProps<ModalProps>(), {
  type: 'help'
})

const emitCloseModal = () => emit('close-modal')

const demoPuffIcon: Ref<UsageTypesEnum> = ref(UsageTypesEnum.joint)

const timeHM = ref('');
const originalTimestamp = ref(0);

let interval: number = 0;

onMounted(() => {
  if (props.puff) {
    originalTimestamp.value = props.puff?.timestamp ?? '';
    timeHM.value = format(props.puff?.timestamp, 'HH:mm') ?? '';
  }

  rotateIcons()
})

onUnmounted(() => {
  clearInterval(interval)
})

/**
 * Rotates icons in the modal
 */
const rotateIcons = () => {
  const icons = Object.values(UsageTypesEnum);

  let i = 0

  interval = setInterval( () => {
    demoPuffIcon.value = icons[i]
    i = (i + 1) % icons.length
  }, 1000)
}

/**
 * Reverts time to original
 */
const onRevertTime = () => {
  timeHM.value = format(originalTimestamp.value, 'HH:mm')

  emit('change-time', {...props.puff, timestamp: getTime(originalTimestamp.value)});
}

/**
 * Moves day by diff
 * @param diff
 */
const moveDayBy = (diff: -1 | 1) => {
  if (!confirm('Are you sure?')) {
    return;
  }

  const nextDay = new Date(props.puff?.timestamp || '');
  nextDay.setDate(nextDay.getDate() + diff);

  //check if next day is after today
  if (diff === 1 && isNextDayAfterToday.value) {
    return;
  }

  const destinationTime = diff < 0 ? endOfDay(nextDay) : startOfDay(nextDay);

  timeHM.value = format(destinationTime, 'HH:mm')

  emit('change-time', {...props.puff, timestamp: getTime(destinationTime)})
}

/**
 * When time is changed
 */
const onTimeChange = () => {
  const newTime = parse(timeHM.value, 'HH:mm', new Date(props.puff?.timestamp || ''))

  emit('change-time', {...props.puff, timestamp: getTime(newTime)})
}

const isNextDayAfterToday = computed(() => {
  const nextDay = new Date(props.puff?.timestamp || '');
  nextDay.setDate(nextDay.getDate() + 1);

  return differenceInDays(endOfDay(nextDay), endOfDay(new Date())) > 0
})

const isDifferentFromOriginal = computed(() => {
  return differenceInDays(getTime(originalTimestamp.value), new Date(props.puff?.timestamp || '')) !== 0
})

const isRevertAvailable = computed(() => {
  return isDifferentFromOriginal.value && !isNextDayAfterToday.value;
});

</script>

<style scoped>
.modal {
  isolation: isolate;
}

.modal-content {
  padding: 0 1rem;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  position: relative;
}

.btn-close {
  color: #D62F75CD;
  background-color: #fff;
  border: 2px solid #D62F75CD;
  border-radius: 5px;
  cursor: pointer;
  width: 2rem;
  height: 2rem;

  align-self: flex-end;
  display: flex;
  align-items: center;
  justify-content: center;
}

h3 {
  margin-top: 1rem;
}

.miniature {
  display: inline-flex;
  height: auto;
  padding: 6px;
  font-size: 1rem;
}

.trash-icon {
  display: inline-flex;
  height: auto;
  padding: 6px;
  font-size: 1rem;
  color: #D62F75CD;
}

h4 {
  margin-top: 1rem;
}

ul {
  margin-top: 0.5rem;
  margin-left: -1rem;
}

li {
  margin-bottom: 0.5rem;
}

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
