<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
    <div v-if="title || $slots.actions" class="px-4 py-3 border-b border-stone-100 flex items-center justify-between gap-2">
      <span class="font-semibold text-stone-700">{{ title }}</span>
      <slot name="actions" />
    </div>
    <div class="p-4">
      <slot />
    </div>
  </div>
</template>
