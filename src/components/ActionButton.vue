<template>
  <button ref="htmlRefHook" class="btn-puff" :class="{'edit-mode': isEditMode}" @click="addPuff(props.weight, props.icon)">
    <span class="plant-icon" v-if="!isEditMode"><font-awesome-icon :icon="`fa-solid fa-${props.icon}`" fixedWidth /></span
    ><span class="weight" v-if="props.weight && !isEditMode">
      {{ props.weight.toFixed(1) }}
    </span>
    <span class="puff-actions" v-if="isEditMode">
      <button @click="onIncreaseWeight()" class="increase">+</button>
      <button @click.stop="onSaveNewWeight()" class="save">
        <span>Save?</span>
        <span>
          {{ props.weight.toFixed(1) }}
        </span>
      </button>
      <button @click="onDecreaseWeight()" class="decrease">-</button>
    </span>
  </button>
</template>

<script lang="ts" setup>
import {db} from "@/database/db";
import getTime from "date-fns/getTime";
import subDays from "date-fns/subDays";
import {nextTick, ref} from "vue";
import {onLongPress} from "@vueuse/core";

type PuffLogsProps = {
  weight: number;
  icon: 'joint' | 'bolt' | 'bong';
  isDemoMode: boolean;
}

const emit = defineEmits(['click', 'longpress'])

const emitClick = () => emit('click')
const emitLongPress = () => emit('longpress')

const onIncreaseWeight = async () => {
  db.settings.update(1, { [props.icon + 'Weight']: props.weight + 0.1 })
}

const onDecreaseWeight = async () => {
  db.settings.update(1, { [props.icon + 'Weight']: props.weight > 0 ? props.weight - 0.1 : 0 })
}

const onSaveNewWeight = () => {
  nextTick(() => isEditMode.value = false)
}

const isEditMode = ref(false);

//@ts-ignore
const props: PuffLogsProps = withDefaults(defineProps<PuffLogsProps>(), {
  weight: () => 0,
  icon: () => 'joint',
  isDemoMode: () => false
})

const addPuff = async (weight: number, icon: 'joint' | 'bolt' | 'bong') => {
  emitClick();

  if (isEditMode.value) return;
  if (props.isDemoMode) return;

  if ((await db.settings.count()) === 0) {
    return;
  }

  db.puffs.add({
    timestamp: getTime(subDays(new Date(), 0)),
    weight,
    icon
  })
}

const htmlRefHook = ref<HTMLElement | null>(null)

const onChangeWeightLongPress = async () => {
  if (props.isDemoMode) return;

  emitLongPress()

  if ((await db.settings.count()) === 0) {
    return;
  }
  isEditMode.value = true;
}

onLongPress(
    htmlRefHook,
    onChangeWeightLongPress,
    { modifiers: { prevent: true }, delay: 420}
)
</script>

<style scoped>
.btn-puff {
  background: linear-gradient(42deg, hsl(89, 67%, 88%), hsl(89, 67%, 94%), hsl(121, 67%, 98%), hsl(89, 67%, 96%), hsl(89, 67%, 82%));
  border: 1px solid #85d62fff;
  box-shadow: inset 0 0 4px hsl(155, 67%, 51%);

  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 2.5rem;
display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;

  height: 100px;
}

.weight {
  font-size: 0.75rem;
  font-weight: 400;
  align-self: end;
  position: relative;
  margin-top: -0.75rem;
  top: 0.5rem;
  left: 0.75rem;
}

.puff-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.puff-actions span {
  font-size: 0.75rem;
  font-weight: 400;
}

.edit-mode {
  padding: 0.25rem;
  height: auto;

  font-size: 2rem;
}

.save {
  background-color: rgba(133, 214, 47, 0.15);
  border: 2px solid rgba(133, 214, 47, 0.25);
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
</style>