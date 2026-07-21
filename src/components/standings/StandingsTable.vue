<script setup lang="ts">
import AppBadge from '../ui/AppBadge.vue'
import type { PlayerStats } from '../../types'

defineProps<{ stats: PlayerStats[] }>()
const emit = defineEmits<{ hide: [playerId: string]; select: [playerId: string] }>()

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
          <th class="py-2 px-2 text-center" title="Spiele">Sp</th>
          <th class="py-2 px-2 text-center" title="Sätze gewonnen : verloren">Sätze</th>
          <th class="py-2 px-2 text-center" title="Punkte +/-">+/-</th>
          <th class="py-2 px-2 text-center font-semibold text-stone-700" title="Gewinnquotient (Sätze gewonnen / Sätze gespielt)">GQ</th>
          <th class="py-2 px-2 text-center"></th>
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
            <button
              type="button"
              class="font-semibold text-stone-800 text-left hover:text-amber-600 transition-colors"
              title="Spiele anzeigen"
              @click="emit('select', s.playerId)"
            >{{ s.name }}</button>
            <AppBadge v-if="!s.active" variant="muted" class="ml-2">Inaktiv</AppBadge>
            <AppBadge v-if="s.joinedAfterRound !== null" variant="info" class="ml-1">ab R{{ s.joinedAfterRound + 1 }}</AppBadge>
          </td>
          <td class="py-3 px-2 text-center text-stone-600">{{ s.gamesPlayed }}</td>
          <td class="py-3 px-2 text-center text-stone-600">
            <span class="font-semibold text-green-600">{{ s.setsWon }}</span>
            <span class="text-stone-400">:</span>
            <span>{{ s.setsPlayed - s.setsWon }}</span>
          </td>
          <td class="py-3 px-2 text-center" :class="s.pointDiff >= 0 ? 'text-green-600' : 'text-red-500'">
            {{ s.pointDiff > 0 ? '+' : '' }}{{ s.pointDiff }}
          </td>
          <td class="py-3 px-2 text-center font-semibold" :class="s.setsPlayed === 0 ? 'text-stone-400' : 'text-amber-600'">
            {{ s.setsPlayed === 0 ? '—' : fmtRatio(s.winRatio) }}
          </td>
          <td class="py-3 px-2 text-center">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Spieler aus Tabelle ausblenden"
              @click="emit('hide', s.playerId)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3C5.5 3 1.7 5.9.5 10c1.2 4.1 5 7 9.5 7s8.3-2.9 9.5-7C18.3 5.9 14.5 3 10 3zm0 11.5A4.5 4.5 0 1110 5.5a4.5 4.5 0 010 9z" />
                <path d="M10 8a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
