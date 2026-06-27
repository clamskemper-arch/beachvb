<script setup lang="ts">
import type { Match } from '../../types'

const props = defineProps<{ matches: Match[]; selectedId: string | null }>()
const emit = defineEmits<{ 'update:selectedId': [id: string] }>()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="(match, i) in matches"
      :key="match.id"
      :class="[
        'px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-colors',
        match.finishedAt !== null
          ? 'border-green-200 bg-green-50 text-green-700'
          : selectedId === match.id
            ? 'border-amber-500 bg-amber-50 text-amber-700'
            : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300',
      ]"
      @click="if (match.finishedAt === null) emit('update:selectedId', match.id)"
    >
      Feld {{ i + 1 }}
      <span v-if="match.finishedAt !== null" class="ml-1">✓</span>
    </button>
  </div>
</template>
