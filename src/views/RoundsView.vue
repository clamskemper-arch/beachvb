<script setup lang="ts">
import { ref } from 'vue'
import AppBadge from '../components/ui/AppBadge.vue'
import { useRoundStore } from '../stores/round'
import { useMatchStore } from '../stores/match'
import { usePlayerStore } from '../stores/player'

const roundStore = useRoundStore()
const matchStore = useMatchStore()
const playerStore = usePlayerStore()

const expanded = ref<Set<string>>(new Set())

function toggle(id: string) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
}

function teamNames(teamId: string): string {
  const team = roundStore.teamById(teamId)
  if (!team) return '?'
  return team.playerIds.map((id) => playerStore.byId(id)?.name ?? '?').join(' & ')
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <h2 class="text-lg font-bold text-stone-800">Rundenverlauf</h2>

    <div v-if="roundStore.all.length === 0" class="text-center py-12 text-stone-400">
      Noch keine Runden gespielt
    </div>

    <div
      v-for="round in [...roundStore.all].reverse()"
      :key="round.id"
      class="bg-white rounded-2xl border border-stone-100 overflow-hidden"
    >
      <button
        class="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50"
        @click="toggle(round.id)"
      >
        <div class="flex items-center gap-3">
          <span class="font-bold text-stone-700">Runde {{ round.number }}</span>
          <AppBadge :variant="round.status === 'finished' ? 'success' : 'warning'">
            {{ round.status === 'finished' ? 'Fertig' : 'Läuft' }}
          </AppBadge>
        </div>
        <span class="text-stone-400 text-sm">
          {{ matchStore.byRound(round.id).length }} Spiele
          {{ expanded.has(round.id) ? '▲' : '▼' }}
        </span>
      </button>

      <div v-if="expanded.has(round.id)" class="border-t border-stone-100">
        <div v-if="round.sittingOutPlayerIds.length" class="px-4 py-2 text-xs text-stone-400 bg-stone-50">
          Pausiert: {{ round.sittingOutPlayerIds.map(id => playerStore.byId(id)?.name).join(', ') }}
        </div>
        <div
          v-for="(matchId, i) in round.matchIds"
          :key="matchId"
          class="px-4 py-3 border-t border-stone-50 flex items-center justify-between text-sm"
        >
          <div class="flex-1">
            <span class="text-stone-400 text-xs block">Feld {{ i + 1 }}</span>
            <span class="text-stone-700">{{ teamNames(matchStore.byId(matchId)?.teamAId ?? '') }}</span>
          </div>
          <div class="px-3 text-center">
            <template v-if="matchStore.byId(matchId)?.finishedAt">
              <span class="font-bold text-stone-800">
                {{ matchStore.byId(matchId)?.scoreA }} : {{ matchStore.byId(matchId)?.scoreB }}
              </span>
            </template>
            <template v-else>
              <span class="text-stone-300">- : -</span>
            </template>
          </div>
          <div class="flex-1 text-right">
            <span class="text-stone-700">{{ teamNames(matchStore.byId(matchId)?.teamBId ?? '') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
