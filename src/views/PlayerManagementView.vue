<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '../components/ui/AppButton.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppModal from '../components/ui/AppModal.vue'
import PlayerToggleRow from '../components/players/PlayerToggleRow.vue'
import { usePlayerStore } from '../stores/player'
import { useTournamentStore } from '../stores/tournament'
import { useRoundStore } from '../stores/round'

const playerStore = usePlayerStore()
const tournamentStore = useTournamentStore()
const roundStore = useRoundStore()

const newName = ref('')
const newGender = ref<'M' | 'W'>('W')
const confirmDeleteId = ref<string | null>(null)

const confirmDeleteName = () =>
  confirmDeleteId.value ? playerStore.byId(confirmDeleteId.value)?.name ?? '' : ''

function regeneratePendingRounds() {
  if (roundStore.all.length > 0) roundStore.schedulePendingRounds()
}

function addPlayer() {
  const n = newName.value.trim()
  if (!n) return
  const currentRoundNumber = roundStore.currentRound?.number ?? null
  const player = playerStore.add(n, currentRoundNumber, newGender.value)
  tournamentStore.addPlayer(player.id)
  newName.value = ''
  regeneratePendingRounds()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') addPlayer()
}

function toggleActive(id: string) {
  playerStore.toggleActive(id)
  if (!playerStore.byId(id)?.active) regeneratePendingRounds()
}

function deactivateAll() {
  playerStore.setAllActive(false)
  regeneratePendingRounds()
}

function removePlayer() {
  if (!confirmDeleteId.value) return
  playerStore.remove(confirmDeleteId.value)
  tournamentStore.removePlayer(confirmDeleteId.value)
  confirmDeleteId.value = null
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-lg font-bold text-stone-800">Spieler verwalten</h2>

    <AppCard title="Spieler hinzufügen">
      <div class="flex gap-2">
        <input
          v-model="newName"
          type="text"
          class="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none text-stone-800 text-base"
          placeholder="Name eingeben"
          @keydown="onKeydown"
        />
        <button
          v-for="g in (['M', 'W'] as const)"
          :key="g"
          :class="[
            'w-12 rounded-xl font-bold text-sm border-2 transition-colors',
            newGender === g
              ? g === 'M' ? 'bg-blue-400 border-blue-400 text-white' : 'bg-pink-400 border-pink-400 text-white'
              : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300',
          ]"
          @click="newGender = g"
        >{{ g }}</button>
        <AppButton :disabled="!newName.trim()" @click="addPlayer">Hinzufügen</AppButton>
      </div>
      <p class="text-xs text-stone-400 mt-2">
        Noch ausstehende Runden werden automatisch neu berechnet.
      </p>
    </AppCard>

    <AppCard title="Alle Spieler">
      <div v-if="playerStore.all.length === 0" class="text-stone-400 text-sm text-center py-4">
        Keine Spieler
      </div>
      <template v-else>
        <div class="flex gap-2 mb-3">
          <AppButton variant="secondary" class="flex-1" @click="playerStore.setAllActive(true)">Alle aktivieren</AppButton>
          <AppButton variant="secondary" class="flex-1" @click="deactivateAll">Alle deaktivieren</AppButton>
        </div>
        <PlayerToggleRow
          v-for="player in playerStore.all"
          :key="player.id"
          :player="player"
          @toggle="toggleActive"
          @set-gender="playerStore.setGender"
          @rename="playerStore.rename"
          @remove="confirmDeleteId = $event"
        />
      </template>
      <p class="text-xs text-stone-400 mt-3">
        {{ playerStore.activePlayers.length }} aktiv · {{ playerStore.all.length - playerStore.activePlayers.length }} inaktiv
      </p>
    </AppCard>

    <AppModal title="Spieler löschen?" :show="confirmDeleteId !== null" @close="confirmDeleteId = null">
      <p class="text-stone-600">
        <strong>{{ confirmDeleteName() }}</strong> wird dauerhaft entfernt und nimmt ab sofort nicht mehr am Turnier teil.
      </p>
      <template #footer>
        <AppButton variant="ghost" class="flex-1" @click="confirmDeleteId = null">Abbrechen</AppButton>
        <AppButton variant="danger" class="flex-1" @click="removePlayer">Löschen</AppButton>
      </template>
    </AppModal>
  </div>
</template>
