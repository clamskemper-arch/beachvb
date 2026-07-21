<script setup lang="ts">
import { computed } from 'vue'
import AppModal from '../ui/AppModal.vue'
import AppBadge from '../ui/AppBadge.vue'
import { usePlayerStore } from '../../stores/player'
import { usePlayerMatches } from '../../composables/usePlayerMatches'
import type { SetResult } from '../../types'

const props = defineProps<{ playerId: string | null }>()
const emit = defineEmits<{ close: [] }>()

const playerStore = usePlayerStore()
const playerIdRef = computed(() => props.playerId)
const { matches } = usePlayerMatches(playerIdRef)

const player = computed(() => (props.playerId ? playerStore.byId(props.playerId) : null))

function resultBadgeVariant(result: 'win' | 'loss' | 'draw' | null): 'success' | 'error' | 'default' | 'muted' {
  if (result === 'win') return 'success'
  if (result === 'loss') return 'error'
  if (result === 'draw') return 'default'
  return 'muted'
}

function resultLabel(result: 'win' | 'loss' | 'draw' | null): string {
  if (result === 'win') return 'Sieg'
  if (result === 'loss') return 'Niederlage'
  if (result === 'draw') return 'Unentschieden'
  return 'Offen'
}

function setLabel(set: SetResult, amTeamA: boolean): string {
  return amTeamA ? `${set.scoreA}:${set.scoreB}` : `${set.scoreB}:${set.scoreA}`
}
</script>

<template>
  <AppModal :title="player?.name ?? 'Spiele'" :show="playerId !== null" @close="emit('close')">
    <div v-if="matches.length === 0" class="text-stone-400 text-sm text-center py-4">
      Noch keine Spiele
    </div>
    <div v-else class="flex flex-col gap-3 max-h-[60vh] overflow-y-auto -mx-1 px-1">
      <div
        v-for="m in matches"
        :key="m.matchId"
        class="rounded-xl border border-stone-100 px-3 py-2.5"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-stone-400">Runde {{ m.roundNumber }}</span>
          <div class="flex items-center gap-2">
            <span v-if="m.finished" class="font-bold text-stone-800 text-sm">
              {{ m.mySetsWon }} : {{ m.opponentSetsWon }}
            </span>
            <AppBadge :variant="resultBadgeVariant(m.result)">{{ resultLabel(m.result) }}</AppBadge>
          </div>
        </div>

        <p v-if="m.teammates.length" class="text-sm text-stone-600 mt-1">
          mit <span class="font-medium text-stone-800">{{ m.teammates.join(', ') }}</span>
        </p>
        <p class="text-sm text-stone-600">
          gegen <span class="font-medium text-stone-800">{{ m.opponents.join(', ') }}</span>
        </p>

        <p v-if="m.sets.length" class="text-xs text-stone-400 mt-1">
          {{ m.sets.map((s) => setLabel(s, m.amTeamA)).join(' · ') }}
        </p>
      </div>
    </div>
  </AppModal>
</template>
