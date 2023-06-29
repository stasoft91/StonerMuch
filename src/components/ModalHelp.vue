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
        <li>Press <ActionButton class="miniature" is-demo-mode :icon="demoPuffIcon" /> to add a puff</li>
        <li>Press and hold <ActionButton class="miniature" is-demo-mode :icon="demoPuffIcon" /> to edit bowl size</li>

        <li>Press <span class="trash-icon"><font-awesome-icon :icon="`fa-solid fa-trash-alt`" fixedWidth /></span> to remove a puff</li>
        <li>Press and hold on <span class="editable">puff`s weight</span> to change it</li>
        <li>Press and hold on the <span class="editable">header</span> to open this help</li>
        <li>Press and hold on the <span class="editable">anything with this underline</span> to activate different actions</li>
        <li>It`s never too late for a backup!</li>

      </ul>
      <h4>Enjoy!</h4>
    </div>

    <div v-if="'changeTime' === props.type" class="modal-content">
      <button class="btn-close" @click="emitCloseModal"> X </button>

      <h2>Change time</h2>

      <input type="time" v-model="timeHM" @change="() => emit('change-time', {...props.puff, timestamp: getTime(parse(timeHM, 'HH:mm', new Date(props.puff?.timestamp)))})"/>
      <button v-if="originalTimeHM !== timeHM" @click="onRevertTime">Revert</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionButton from './ActionButton.vue'
import {onMounted, onUnmounted, ref} from "vue";
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import getTime from 'date-fns/getTime'

import type {Puff} from "@/database/db";
const emit = defineEmits(['close-modal', 'change-time'])

type ModalProps = {
  type: 'help' | 'changeTime';
  puff?: Puff;
}

const props: ModalProps = withDefaults(defineProps<ModalProps>(), {
  type: () => ''
})

const emitCloseModal = () => emit('close-modal')

const demoPuffIcon = ref(UsageTypesEnum.joint)

const timeHM = ref('');
const originalTimeHM = ref('');

let interval;


onMounted(() => {
  originalTimeHM.value = format(props.puff?.timestamp, 'HH:mm') ?? '';
  timeHM.value = format(props.puff?.timestamp, 'HH:mm') ?? '';
  rotateIcons()
})

onUnmounted(() => {
  clearInterval(interval)
})

//rotate icons each second
const rotateIcons = () => {
  const icons = Usa
  let i = 0
  interval =setInterval(() => {
    demoPuffIcon.value = icons[i]
    i = i === 2 ? 0 : i + 1
  }, 1000)
}

const onRevertTime = () => {
  timeHM.value = originalTimeHM.value
  emit('change-time', props.puff)
}
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
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;

  align-self: flex-end;
}

h3{
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
</style>