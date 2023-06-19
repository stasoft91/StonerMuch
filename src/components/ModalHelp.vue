<template>
  <div class="modal">
    <div class="modal-content">
      <button class="btn-close" @click="emitCloseModal"> X </button>

      <h2>Hello!</h2>

      <p>Thanks for using Stoner Much!</p>
      <p>It's a simple app to track your smoking habits.</p>
      <p>It's completely free and open source.</p>
      <p>Feel free to contribute on <a href="https://github.com/stasoft91/StonerMuch">GitHub</a>.</p>
      <p>Enjoy!</p>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close-modal'])

const emitCloseModal = () => emit('close-modal')
</script>

<style scoped>
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
</style>