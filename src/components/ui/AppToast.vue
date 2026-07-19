<script setup lang="ts">
defineProps<{ show: boolean; message: string }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="show"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl bg-stone-800 text-white text-sm font-medium shadow-lg flex items-center gap-2"
      >
        <span class="text-green-400">✓</span>
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: opacity 0.2s, transform 0.2s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 0.5rem); }
</style>
