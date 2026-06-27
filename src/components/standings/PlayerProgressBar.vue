<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerStats } from '../../types'

const props = defineProps<{ stats: PlayerStats; minGames: number }>()

const pct = computed(() => Math.min(100, (props.stats.gamesPlayed / props.minGames) * 100))
const reached = computed(() => props.stats.gamesPlayed >= props.minGames)
</script>

<template>
  <div :class="['flex items-center gap-3', !stats.active ? 'opacity-50' : '']">
    <span class="w-24 text-sm font-medium text-stone-700 truncate">{{ stats.name }}</span>
    <div class="flex-1 bg-stone-200 rounded-full h-3 overflow-hidden">
      <div
        :class="['h-full rounded-full transition-all', reached ? 'bg-green-500' : 'bg-amber-400']"
        :style="{ width: pct + '%' }"
      />
    </div>
    <span class="text-xs text-stone-500 w-12 text-right">
      {{ stats.gamesPlayed }}/{{ minGames }}
    </span>
  </div>
</template>
