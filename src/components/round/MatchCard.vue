<script setup lang="ts">
import { computed } from 'vue'
import AppBadge from '../ui/AppBadge.vue'
import type { Match } from '../../types'
import { useRoundStore } from '../../stores/round'
import { usePlayerStore } from '../../stores/player'

const props = defineProps<{ match: Match; courtNumber: number }>()

const roundStore = useRoundStore()
const playerStore = usePlayerStore()

function teamNames(teamId: string): string {
  const team = roundStore.teamById(teamId)
  if (!team) return ''
  return team.playerIds.map((id) => playerStore.byId(id)?.name ?? '?').join(' & ')
}

const teamA = computed(() => teamNames(props.match.teamAId))
const teamB = computed(() => teamNames(props.match.teamBId))
const finished = computed(() => props.match.finishedAt !== null)
</script>

<template>
  <div
    :class="[
      'bg-white rounded-2xl border-2 overflow-hidden',
      finished ? 'border-green-200' : 'border-amber-200',
    ]"
  >
    <div class="flex items-center justify-between px-4 py-2 bg-amber-50 border-b border-amber-100">
      <span class="font-bold text-amber-700">Feld {{ courtNumber }}</span>
      <AppBadge :variant="finished ? 'success' : 'warning'">
        {{ finished ? 'Fertig' : 'Offen' }}
      </AppBadge>
    </div>

    <div class="p-4">
      <div class="grid grid-cols-3 items-center gap-2">
        <div class="text-center">
          <p class="font-semibold text-stone-800 text-sm leading-tight">{{ teamA }}</p>
        </div>

        <div class="text-center">
          <template v-if="finished">
            <span class="text-2xl font-bold text-stone-800">
              {{ match.scoreA }} : {{ match.scoreB }}
            </span>
          </template>
          <template v-else>
            <span class="text-xl text-stone-400 font-light">vs</span>
          </template>
        </div>

        <div class="text-center">
          <p class="font-semibold text-stone-800 text-sm leading-tight">{{ teamB }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
