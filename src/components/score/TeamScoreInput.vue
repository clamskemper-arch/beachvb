<script setup lang="ts">
const props = defineProps<{ teamName: string; score: number }>()
const emit = defineEmits<{ 'update:score': [n: number] }>()

function inc() { emit('update:score', props.score + 1) }
function dec() { if (props.score > 0) emit('update:score', props.score - 1) }

function onInput(e: Event) {
  const v = parseInt((e.target as HTMLInputElement).value, 10)
  if (!isNaN(v) && v >= 0) emit('update:score', v)
}

function onFocus(e: FocusEvent) {
  (e.target as HTMLInputElement).select()
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <p class="font-semibold text-stone-700 text-sm text-center min-h-10 flex items-center">
      {{ teamName }}
    </p>
    <button
      class="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-3xl font-bold flex items-center justify-center select-none"
      @click="inc"
    >+</button>
    <input
      type="number"
      :value="score"
      min="0"
      inputmode="numeric"
      class="text-5xl font-bold text-stone-800 w-24 text-center tabular-nums rounded-xl border-2 border-transparent focus:border-amber-400 outline-none bg-stone-50 py-1"
      @input="onInput"
      @focus="onFocus"
    />
    <button
      :disabled="score <= 0"
      class="w-16 h-16 rounded-full bg-stone-200 hover:bg-stone-300 active:bg-stone-400 text-stone-700 text-3xl font-bold flex items-center justify-center select-none disabled:opacity-30"
      @click="dec"
    >−</button>
  </div>
</template>
