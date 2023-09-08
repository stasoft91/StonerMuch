<template>
  <div class="modal-content">
    <h2>Hello!</h2>

    <p>Thanks for using Stoner Much!</p>
    <p>It's a simple app to track your smoking habits.</p>
    <p>It's completely free and open source.</p>
    <p>Feel free to contribute on <a href="https://github.com/stasoft91/StonerMuch">GitHub</a>.</p>

    <h3>How to use</h3>
    <ul>
      <li>
        Press <ActionButton class="miniature" is-demo-mode :icon="demoPuffIcon" :weight="0" /> to
        add a puff
      </li>
      <li>
        Press and hold
        <ActionButton class="miniature" is-demo-mode :icon="demoPuffIcon" :weight="0" /> to edit
        bowl size
      </li>

      <li>
        Press
        <span class="trash-icon"
          ><font-awesome-icon :icon="`fa-solid fa-trash-alt`" fixedWidth
        /></span>
        to remove a puff
      </li>
      <li>Press and hold on <span class="editable">puff`s weight</span> to change it</li>
      <li>Press and hold on the <span class="editable">header</span> to open this help</li>
      <li>
        Press and hold on the <span class="editable">anything with this underline</span> to activate
        different actions
      </li>
      <li>It`s never too late for a backup!</li>
    </ul>
    <h4>Enjoy!</h4>
  </div>
</template>
<script setup lang="ts">
import ActionButton from '@/components/ActionButton.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'
import { UsageTypesEnum } from '@/types/types'

const demoPuffIcon: Ref<UsageTypesEnum> = ref(UsageTypesEnum.joint)

let intervalIconRotation: number = 0

onMounted(() => {
  rotateIcons()
})

onUnmounted(() => {
  clearInterval(intervalIconRotation)
})

/**
 * Rotates icons in the modal
 */
const rotateIcons = () => {
  const icons = Object.values(UsageTypesEnum)

  let i = 0

  intervalIconRotation = setInterval(() => {
    demoPuffIcon.value = icons[i]
    i = (i + 1) % icons.length
  }, 1000)
}
</script>

<style scoped>
.miniature {
  display: inline-flex !important;
  height: auto !important;
  padding: 6px !important;
  font-size: 1rem !important;
  width: unset;
}

.trash-icon {
  display: inline-flex;
  height: auto;
  padding: 6px;
  font-size: 1rem;
  color: #d62f75cd;
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

.with-gap .flex button {
  padding: 0.5rem;
}
</style>
