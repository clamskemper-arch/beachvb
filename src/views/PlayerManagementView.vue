<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '../components/ui/AppButton.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppModal from '../components/ui/AppModal.vue'
import AppToast from '../components/ui/AppToast.vue'
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
const showMenu = ref(false)
const showRegenerateConfirm = ref(false)
const showRegenerateToast = ref(false)
let toastTimeout: ReturnType<typeof setTimeout> | undefined

const confirmDeleteName = () =>
  confirmDeleteId.value ? playerStore.byId(confirmDeleteId.value)?.name ?? '' : ''

function addPlayer() {
  const n = newName.value.trim()
  if (!n) return
  const currentRoundNumber = roundStore.currentRound?.number ?? null
  const player = playerStore.add(n, currentRoundNumber, newGender.value)
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

function activateAll() {
  playerStore.setAllActive(true)
  showMenu.value = false
}

function deactivateAll() {
  playerStore.setAllActive(false)
  showMenu.value = false
}

function openRegenerateConfirm() {
  showMenu.value = false
  showRegenerateConfirm.value = true
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
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-stone-800">Spieler verwalten</h2>
      <p class="text-sm text-stone-500">
        {{ playerStore.activePlayers.length }} aktiv · {{ playerStore.all.length - playerStore.activePlayers.length }} inaktiv
      </p>
    </div>

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
        Neue Spieler werden erst ab der nächsten neu berechneten Runde berücksichtigt.
      </p>
    </AppCard>

    <AppCard title="Alle Spieler">
      <template #actions>
        <div class="relative">
          <button
            class="w-9 h-9 flex items-center justify-center rounded-lg text-stone-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            title="Aktionen"
            @click="showMenu = !showMenu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
          </button>

          <template v-if="showMenu">
            <div class="fixed inset-0 z-10" @click="showMenu = false" />
            <div class="absolute right-0 top-full mt-2 z-20 w-56 bg-white rounded-xl shadow-lg border border-stone-100 py-1">
              <button
                class="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                @click="activateAll"
              >Alle aktivieren</button>
              <button
                class="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                @click="deactivateAll"
              >Alle deaktivieren</button>
              <div class="border-t border-stone-100 my-1" />
              <button
                class="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:text-stone-300 disabled:hover:bg-transparent"
                :disabled="!roundStore.currentRound"
                @click="openRegenerateConfirm"
              >Aktuelle Runde neu berechnen</button>
            </div>
          </template>
        </div>
      </template>

      <div v-if="playerStore.all.length === 0" class="text-stone-400 text-sm text-center py-4">
        Keine Spieler
      </div>
      <template v-else>
        <PlayerToggleRow
          v-for="player in playerStore.all"
          :key="player.id"
          :player="player"
          @toggle="playerStore.toggleActive"
          @set-gender="playerStore.setGender"
          @rename="playerStore.rename"
          @remove="confirmDeleteId = $event"
        />
      </template>
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
  </div>
</template>
