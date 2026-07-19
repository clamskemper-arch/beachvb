<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '../components/ui/AppButton.vue'
import MatchCard from '../components/round/MatchCard.vue'
import SittingOutPanel from '../components/round/SittingOutPanel.vue'
import { useRoundStore } from '../stores/round'
import { useMatchStore } from '../stores/match'
import { usePlayerStore } from '../stores/player'
import { useTournamentStore } from '../stores/tournament'
import { usePlayerStats } from '../composables/usePlayerStats'

const roundStore = useRoundStore()
const matchStore = useMatchStore()
const playerStore = usePlayerStore()
const tournamentStore = useTournamentStore()
const { sorted } = usePlayerStats()

const currentRound = computed(() => roundStore.currentRound)
const pendingCount = computed(() => roundStore.pendingRounds.length)
const hasAnyRound = computed(() => roundStore.all.length > 0)
const matches = computed(() =>
  currentRound.value ? matchStore.byRound(currentRound.value.id) : [],
)
const activeCount = computed(() => playerStore.activePlayers.length)
const minNeeded = computed(() => (tournamentStore.config?.teamSize ?? 2) * 2)
const canGenerate = computed(() => activeCount.value >= minNeeded.value)

const minGames = computed(() => tournamentStore.config?.minGamesPerPlayer ?? 0)
const allReachedMinGames = computed(() => {
  if (minGames.value === 0) return false
  return sorted.value.filter((s) => s.active).every((s) => s.gamesPlayed >= minGames.value)
})
</script>

<template>
  <div class="flex flex-col gap-4">

    <!-- No rounds yet: start button -->
    <div v-if="!hasAnyRound" class="flex flex-col items-center gap-6 py-12">
      <p class="text-6xl">🏐</p>
      <p class="text-stone-600 text-center">
        Bereit für die erste Runde!<br />
        <span class="text-sm text-stone-400">{{ activeCount }} aktive Spieler</span>
      </p>
      <AppButton size="lg" :disabled="!canGenerate" @click="roundStore.schedulePendingRounds()">
        Turnier starten
      </AppButton>
      <p v-if="!canGenerate" class="text-sm text-red-400 text-center">
        Mindestens {{ minNeeded }} aktive Spieler benötigt
      </p>
    </div>

    <!-- All rounds done: no active, no pending -->
    <div v-else-if="!currentRound && pendingCount === 0" class="flex flex-col gap-3">
      <div v-if="allReachedMinGames" class="rounded-xl bg-green-50 border border-green-200 px-4 py-4 flex flex-col gap-3">
        <p class="text-green-800 font-semibold text-center">Alle Spieler haben die Mindestspielzahl erreicht</p>
        <p class="text-green-700 text-sm text-center">Das Turnier kann beendet oder mit weiteren Runden fortgesetzt werden.</p>
        <AppButton size="lg" full-width :disabled="!canGenerate" @click="roundStore.schedulePendingRounds(true)">
          Weitere Runde generieren
        </AppButton>
      </div>
      <div v-else class="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 text-center">
        Keine weiteren Runden geplant. Runden neu berechnen oder Turnier im Info-Tab beenden.
      </div>
      <AppButton variant="secondary" full-width :disabled="!canGenerate" @click="roundStore.schedulePendingRounds()">
        Runden neu berechnen
      </AppButton>
    </div>

    <!-- Active round -->
    <template v-else-if="currentRound">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-stone-800">Runde {{ currentRound.number }}</h2>
        <span class="text-sm font-medium px-3 py-1 rounded-full bg-amber-100 text-amber-700">Läuft</span>
      </div>

      <p v-if="pendingCount > 0" class="text-xs text-stone-400 text-center">
        {{ pendingCount }} weitere {{ pendingCount === 1 ? 'Runde' : 'Runden' }} geplant
      </p>

      <SittingOutPanel :player-ids="currentRound.sittingOutPlayerIds" />

      <div class="flex flex-col gap-3">
        <MatchCard
          v-for="(match, i) in matches"
          :key="match.id"
          :match="match"
          :court-number="i + 1"
        />
      </div>

      <div class="flex flex-col gap-2 pt-2">
        <AppButton variant="secondary" full-width :disabled="!canGenerate" @click="roundStore.schedulePendingRounds()">
          Runden neu berechnen
        </AppButton>
      </div>
    </template>

  </div>
</template>
