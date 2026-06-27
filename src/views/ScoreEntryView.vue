<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MatchSelector from '../components/score/MatchSelector.vue'
import ScoreEntryCard from '../components/score/ScoreEntryCard.vue'
import { useRoundStore } from '../stores/round'
import { useMatchStore } from '../stores/match'

const roundStore = useRoundStore()
const matchStore = useMatchStore()

const currentRound = computed(() => roundStore.currentRound)
const matches = computed(() =>
  currentRound.value ? matchStore.byRound(currentRound.value.id) : [],
)
const pendingMatches = computed(() => matches.value.filter((m) => m.finishedAt === null))
const allDone = computed(() =>
  matches.value.length > 0 && pendingMatches.value.length === 0,
)

const selectedId = ref<string | null>(null)
const selectedMatch = computed(() =>
  selectedId.value ? matchStore.byId(selectedId.value) : null,
)

watch(
  pendingMatches,
  (pending) => {
    if (pending.length && (!selectedId.value || !pending.find((m) => m.id === selectedId.value))) {
      selectedId.value = pending[0].id
    }
  },
  { immediate: true },
)

function onConfirmed() {
  const next = pendingMatches.value.find((m) => m.id !== selectedId.value)
  selectedId.value = next?.id ?? null
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-lg font-bold text-stone-800">Ergebnisse eintragen</h2>

    <div v-if="!currentRound" class="text-center py-12 text-stone-400">
      Noch keine Runde gestartet
    </div>

    <template v-else-if="allDone">
      <div class="flex flex-col items-center gap-4 py-12">
        <p class="text-5xl">✅</p>
        <p class="text-stone-600 font-medium">Alle Ergebnisse eingetragen!</p>
        <p class="text-stone-400 text-sm">Gehe zur aktiven Runde um die nächste Runde zu starten.</p>
      </div>
    </template>

    <template v-else>
      <div>
        <p class="text-sm text-stone-500 mb-2">Feld auswählen:</p>
        <MatchSelector :matches="matches" :selected-id="selectedId" @update:selected-id="selectedId = $event" />
      </div>

      <ScoreEntryCard
        v-if="selectedMatch && selectedMatch.finishedAt === null"
        :match="selectedMatch"
        @confirmed="onConfirmed"
      />

      <p class="text-xs text-stone-400 text-center">
        {{ pendingMatches.length }} von {{ matches.length }} Spielen noch offen
      </p>
    </template>
  </div>
</template>
