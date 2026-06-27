<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
}>()
</script>

<template>
  <button
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center font-semibold rounded-xl transition-colors select-none',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      {
        'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white': !variant || variant === 'primary',
        'bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 border border-stone-300': variant === 'secondary',
        'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white': variant === 'danger',
        'bg-transparent hover:bg-stone-100 active:bg-stone-200 text-stone-700': variant === 'ghost',
        'px-3 py-2 text-sm min-h-10': size === 'sm',
        'px-5 py-3 text-base min-h-12': !size || size === 'md',
        'px-6 py-4 text-lg min-h-14': size === 'lg',
        'w-full': fullWidth,
      },
    ]"
  >
    <slot />
  </button>
</template>
