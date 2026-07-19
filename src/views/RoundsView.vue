<script setup lang="ts">
import { ref } from 'vue'
import AppBadge from '../components/ui/AppBadge.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppModal from '../components/ui/AppModal.vue'
import AppToast from '../components/ui/AppToast.vue'
import ScoreEntryCard from '../components/score/ScoreEntryCard.vue'
import { useRoundStore } from '../stores/round'
import { useMatchStore } from '../stores/match'
import { usePlayerStore } from '../stores/player'

const roundStore = useRoundStore()
const matchStore = useMatchStore()
const playerStore = usePlayerStore()

const expanded = ref<Set<string>>(new Set())
const editingMatchId = ref<string | null>(null)
const showRegenerateConfirm = ref(false)
const showRegenerateToast = ref(false)
let toastTimeout: ReturnType<typeof setTimeout> | undefined

function toggle(id: string) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
}

function teamNames(teamId: string): string {
  const team = roundStore.teamById(teamId)
  if (!team) return '?'
  return team.playerIds.map((id) => playerStore.byId(id)?.name ?? '?').join(' & ')
}

function toggleEdit(matchId: string) {
  editingMatchId.value = editingMatchId.value === matchId ? null : matchId
}

function regenerateCurrentRound() {
  roundStore.regenerateCurrentRound()
  showRegenerateConfirm.value = false

  clearTimeout(toastTimeout)
  showRegenerateToast.value = true
  toastTimeout = setTimeout(() => { showRegenerateToast.value = false }, 3000)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <h2 class="text-lg font-bold text-stone-800">Rundenverlauf</h2>

    <AppButton
      v-if="roundStore.currentRound"
      variant="secondary"
      full-width
      @click="showRegenerateConfirm = true"
    >
      Aktuelle Runde neu berechnen
    </AppButton>

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
          <AppBadge :variant="round.status === 'finished' ? 'success' : round.status === 'active' ? 'warning' : 'muted'">
            {{ round.status === 'finished' ? 'Fertig' : round.status === 'active' ? 'Läuft' : 'Geplant' }}
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

        <template v-for="(matchId, i) in round.matchIds" :key="matchId">
          <div class="px-4 py-3 border-t border-stone-50 flex items-center gap-2 text-sm">
            <div class="flex-1">
              <span class="text-stone-400 text-xs block">Feld {{ i + 1 }}</span>
              <span class="text-stone-700">{{ teamNames(matchStore.byId(matchId)?.teamAId ?? '') }}</span>
            </div>

            <div class="px-2 text-center shrink-0">
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

            <button
              v-if="matchStore.byId(matchId)?.finishedAt || round.status === 'active'"
              :class="[
                'ml-1 w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors shrink-0',
                editingMatchId === matchId
                  ? 'bg-amber-100 text-amber-600'
                  : 'text-stone-400 hover:text-amber-500 hover:bg-amber-50',
              ]"
              title="Ergebnis bearbeiten"
              @click="toggleEdit(matchId)"
            >✏️</button>
          </div>

          <div v-if="editingMatchId === matchId && matchStore.byId(matchId)" class="px-4 pb-4 border-t border-stone-50">
            <ScoreEntryCard
              :match="matchStore.byId(matchId)!"
              @confirmed="editingMatchId = null"
            />
          </div>
        </template>
      </div>
    </div>
  </div>

  <AppModal title="Runde neu berechnen?" :show="showRegenerateConfirm" @close="showRegenerateConfirm = false">
    <p class="text-stone-600 text-sm">
      Die aktuelle Runde wird entfernt und mit neuen Teams/Paarungen neu berechnet. Bereits eingetragene Ergebnisse dieser Runde gehen dabei verloren.
    </p>
    <template #footer>
      <AppButton variant="secondary" full-width @click="showRegenerateConfirm = false">Abbrechen</AppButton>
      <AppButton variant="danger" full-width @click="regenerateCurrentRound">Neu berechnen</AppButton>
    </template>
  </AppModal>

  <AppToast :show="showRegenerateToast" message="Runde wurde neu erstellt" />
</template>
