<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppButton from '../components/ui/AppButton.vue'
import AppModal from '../components/ui/AppModal.vue'
import MatchCard from '../components/round/MatchCard.vue'
import SittingOutPanel from '../components/round/SittingOutPanel.vue'
import { useRoundStore } from '../stores/round'
import { useMatchStore } from '../stores/match'
import { usePlayerStore } from '../stores/player'
import { useTournamentStore } from '../stores/tournament'
import { usePlayerStats } from '../composables/usePlayerStats'
import { useRouter } from 'vue-router'

const roundStore = useRoundStore()
const matchStore = useMatchStore()
const playerStore = usePlayerStore()
const tournamentStore = useTournamentStore()
const router = useRouter()
const { sitOutCounts } = usePlayerStats()

const showFinishConfirm = ref(false)

const currentRound = computed(() => roundStore.currentRound)
const matches = computed(() =>
  currentRound.value ? matchStore.byRound(currentRound.value.id) : [],
)
const allDone = computed(() =>
  currentRound.value ? matchStore.allFinishedInRound(currentRound.value.id) : false,
)
const activeCount = computed(() => playerStore.activePlayers.length)
const minNeeded = computed(() => (tournamentStore.config?.teamSize ?? 2) * 2)
const canGenerate = computed(() => activeCount.value >= minNeeded.value)

function generateRound() {
  roundStore.generate(sitOutCounts.value)
}

function finishTournament() {
  tournamentStore.finish()
  router.push('/setup')
}

watch(allDone, (done) => {
  if (done && canGenerate.value) {
    roundStore.generate(sitOutCounts.value)
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="!currentRound" class="flex flex-col items-center gap-6 py-12">
      <p class="text-6xl">🏐</p>
      <p class="text-stone-600 text-center">
        Bereit für die erste Runde!<br />
        <span class="text-sm text-stone-400">{{ activeCount }} aktive Spieler</span>
      </p>
      <AppButton size="lg" :disabled="!canGenerate" @click="generateRound">
        Erste Runde starten
      </AppButton>
      <p v-if="!canGenerate" class="text-sm text-red-400 text-center">
        Mindestens {{ minNeeded }} aktive Spieler benötigt
      </p>
    </div>

    <template v-else>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-stone-800">Runde {{ currentRound.number }}</h2>
        <span :class="['text-sm font-medium px-3 py-1 rounded-full', currentRound.status === 'finished' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700']">
          {{ currentRound.status === 'finished' ? '✓ Abgeschlossen' : 'Läuft' }}
        </span>
      </div>

      <SittingOutPanel :player-ids="currentRound.sittingOutPlayerIds" />

      <div class="flex flex-col gap-3">
        <MatchCard
          v-for="(match, i) in matches"
          :key="match.id"
          :match="match"
          :court-number="i + 1"
        />
      </div>

      <div v-if="allDone && !canGenerate" class="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center">
        Zu wenige aktive Spieler für eine neue Runde. Spieler aktivieren oder hinzufügen.
      </div>

      <div class="pt-2">
        <AppButton variant="ghost" full-width @click="showFinishConfirm = true">
          Turnier beenden
        </AppButton>
      </div>
    </template>
  </div>

  <AppModal title="Turnier beenden?" :show="showFinishConfirm" @close="showFinishConfirm = false">
    <p class="text-stone-600 text-sm">Das Turnier wird abgeschlossen und alle Daten werden zurückgesetzt.</p>
    <template #footer>
      <AppButton variant="secondary" full-width @click="showFinishConfirm = false">Abbrechen</AppButton>
      <AppButton variant="danger" full-width @click="finishTournament">Beenden</AppButton>
    </template>
  </AppModal>
</template>
