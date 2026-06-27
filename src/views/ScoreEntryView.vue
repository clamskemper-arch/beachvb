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

const selectedId = ref<string | null>(null)
const selectedMatch = computed(() =>
  selectedId.value ? matchStore.byId(selectedId.value) : null,
)

watch(
  pendingMatches,
  (pending) => {
    if (pending.length && (!selectedId.value || !matches.value.find((m) => m.id === selectedId.value))) {
      selectedId.value = pending[0].id
    }
  },
  { immediate: true },
)

function onConfirmed() {
  const next = pendingMatches.value.find((m) => m.id !== selectedId.value)
  if (next) selectedId.value = next.id
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-lg font-bold text-stone-800">Ergebnisse eintragen</h2>

    <div v-if="!currentRound" class="text-center py-12 text-stone-400">
      Noch keine Runde gestartet
    </div>

    <template v-else>
      <div>
        <p class="text-sm text-stone-500 mb-2">Feld auswählen:</p>
        <MatchSelector :matches="matches" :selected-id="selectedId" @update:selected-id="selectedId = $event" />
      </div>

      <p class="text-xs text-stone-400 text-center">
        <template v-if="pendingMatches.length > 0">
          {{ pendingMatches.length }} von {{ matches.length }} Spielen noch offen
        </template>
        <template v-else>
          Alle Ergebnisse eingetragen — abgeschlossene Spiele können bearbeitet werden
        </template>
      </p>

      <ScoreEntryCard
        v-if="selectedMatch"
        :match="selectedMatch"
        @confirmed="onConfirmed"
      />
    </template>
  </div>
</template>
