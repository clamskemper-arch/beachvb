<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppModal from '../ui/AppModal.vue'
import AppBadge from '../ui/AppBadge.vue'
import { usePlayerStore } from '../../stores/player'
import { usePlayerMatches } from '../../composables/usePlayerMatches'
import type { SetResult } from '../../types'

const props = defineProps<{ playerId: string | null }>()
const emit = defineEmits<{ close: [] }>()

const playerStore = usePlayerStore()
const playerIdRef = computed(() => props.playerId)
const { matches, teammateCounts, opponentCounts } = usePlayerMatches(playerIdRef)

const player = computed(() => (props.playerId ? playerStore.byId(props.playerId) : null))

type Tab = 'matches' | 'teammates' | 'opponents'
const tab = ref<Tab>('matches')
watch(() => props.playerId, () => { tab.value = 'matches' })

const tabs: { id: Tab; label: string }[] = [
  { id: 'matches', label: 'Spiele' },
  { id: 'teammates', label: 'Mit Spielern' },
  { id: 'opponents', label: 'Gegen Spieler' },
]

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
    <div class="flex gap-1 -mt-1 mb-3 bg-stone-100 rounded-xl p-1">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        :class="[
          'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors',
          tab === t.id ? 'bg-white text-amber-600 shadow-sm' : 'text-stone-500 hover:text-stone-700',
        ]"
        @click="tab = t.id"
      >{{ t.label }}</button>
    </div>

    <template v-if="tab === 'matches'">
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
    </template>

    <template v-else-if="tab === 'teammates'">
      <div v-if="teammateCounts.length === 0" class="text-stone-400 text-sm text-center py-4">
        Noch keine gemeinsamen Spiele
      </div>
      <div v-else class="flex flex-col gap-1 max-h-[60vh] overflow-y-auto -mx-1 px-1">
        <div
          v-for="c in teammateCounts"
          :key="c.playerId"
          class="flex items-center justify-between rounded-xl border border-stone-100 px-3 py-2.5"
        >
          <span class="font-medium text-stone-800 text-sm">{{ c.name }}</span>
          <AppBadge>{{ c.count }}× zusammen</AppBadge>
        </div>
      </div>
    </template>

    <template v-else>
      <div v-if="opponentCounts.length === 0" class="text-stone-400 text-sm text-center py-4">
        Noch keine Spiele gegeneinander
      </div>
      <div v-else class="flex flex-col gap-1 max-h-[60vh] overflow-y-auto -mx-1 px-1">
        <div
          v-for="c in opponentCounts"
          :key="c.playerId"
          class="flex items-center justify-between rounded-xl border border-stone-100 px-3 py-2.5"
        >
          <span class="font-medium text-stone-800 text-sm">{{ c.name }}</span>
          <AppBadge>{{ c.count }}× gegeneinander</AppBadge>
        </div>
      </div>
    </template>
  </AppModal>
</template>
