<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
    <div v-if="title" class="px-4 py-3 border-b border-stone-100 font-semibold text-stone-700">
      {{ title }}
    </div>
    <div class="p-4">
      <slot />
    </div>
  </div>
</template>
