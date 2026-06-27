<script setup lang="ts">
defineProps<{ variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted' }>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      {
        'bg-stone-100 text-stone-600': !variant || variant === 'default',
        'bg-green-100 text-green-700': variant === 'success',
        'bg-amber-100 text-amber-700': variant === 'warning',
        'bg-red-100 text-red-700': variant === 'error',
        'bg-sky-100 text-sky-700': variant === 'info',
        'bg-stone-100 text-stone-400': variant === 'muted',
      },
    ]"
  >
    <slot />
  </span>
</template>
