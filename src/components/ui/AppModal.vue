<script setup lang="ts">
defineProps<{ title: string; show: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="emit('close')"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm">
          <div class="px-5 py-4 border-b border-stone-100 font-semibold text-lg text-stone-800">
            {{ title }}
          </div>
          <div class="px-5 py-4">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-5 py-4 border-t border-stone-100 flex gap-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
