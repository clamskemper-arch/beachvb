<script setup lang="ts">
import AppBadge from '../ui/AppBadge.vue'
import type { PlayerStats } from '../../types'

defineProps<{ stats: PlayerStats[] }>()

function fmtRatio(r: number): string {
  return (r * 100).toFixed(1) + ' %'
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-stone-200 text-stone-500 text-xs">
          <th class="text-left py-2 px-2">#</th>
          <th class="text-left py-2 px-2">Spieler</th>
          <th class="py-2 px-2 text-center">Sp</th>
          <th class="py-2 px-2 text-center">S</th>
          <th class="py-2 px-2 text-center">N</th>
          <th class="py-2 px-2 text-center">+/-</th>
          <th class="py-2 px-2 text-center font-semibold text-stone-700">GQ</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(s, i) in stats"
          :key="s.playerId"
          :class="['border-b border-stone-100', !s.active ? 'opacity-50' : '']"
        >
          <td class="py-3 px-2 text-stone-400 font-medium">{{ i + 1 }}</td>
          <td class="py-3 px-2">
            <span class="font-semibold text-stone-800">{{ s.name }}</span>
            <AppBadge v-if="!s.active" variant="muted" class="ml-2">Inaktiv</AppBadge>
            <AppBadge v-if="s.joinedAfterRound !== null" variant="info" class="ml-1">ab R{{ s.joinedAfterRound + 1 }}</AppBadge>
          </td>
          <td class="py-3 px-2 text-center text-stone-600">{{ s.gamesPlayed }}</td>
          <td class="py-3 px-2 text-center font-semibold text-green-600">{{ s.wins }}</td>
          <td class="py-3 px-2 text-center text-red-500">{{ s.losses }}</td>
          <td class="py-3 px-2 text-center" :class="s.pointDiff >= 0 ? 'text-green-600' : 'text-red-500'">
            {{ s.pointDiff > 0 ? '+' : '' }}{{ s.pointDiff }}
          </td>
          <td class="py-3 px-2 text-center font-semibold" :class="s.gamesPlayed === 0 ? 'text-stone-400' : 'text-amber-600'">
            {{ s.gamesPlayed === 0 ? '—' : fmtRatio(s.winRatio) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
