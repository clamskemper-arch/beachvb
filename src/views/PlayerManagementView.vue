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
const confirmDeleteId = ref<string | null>(null)

const confirmDeleteName = () =>
  confirmDeleteId.value ? playerStore.byId(confirmDeleteId.value)?.name ?? '' : ''

function addPlayer() {
  const n = newName.value.trim()
  if (!n) return
  const currentRoundNumber = roundStore.currentRound?.number ?? null
  const player = playerStore.add(n, currentRoundNumber)
  tournamentStore.addPlayer(player.id)
  newName.value = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') addPlayer()
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
        <AppButton :disabled="!newName.trim()" @click="addPlayer">Hinzufügen</AppButton>
      </div>
      <p class="text-xs text-stone-400 mt-2">
        Neue Spieler werden ab der nächsten Runde berücksichtigt.
      </p>
    </AppCard>

    <AppCard title="Alle Spieler">
      <div v-if="playerStore.all.length === 0" class="text-stone-400 text-sm text-center py-4">
        Keine Spieler
      </div>
      <div v-else>
        <PlayerToggleRow
          v-for="player in playerStore.all"
          :key="player.id"
          :player="player"
          @toggle="playerStore.toggleActive"
          @set-gender="playerStore.setGender"
          @remove="confirmDeleteId = $event"
        />
      </div>
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
