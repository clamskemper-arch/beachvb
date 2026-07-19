<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '../components/ui/AppButton.vue'
import AppModal from '../components/ui/AppModal.vue'
import { useTournamentStore } from '../stores/tournament'
import { usePlayerStore } from '../stores/player'
import { useRoundStore } from '../stores/round'

const tournamentStore = useTournamentStore()
const playerStore = usePlayerStore()
const roundStore = useRoundStore()
const router = useRouter()

const tournament = computed(() => tournamentStore.tournament)
const config = computed(() => tournamentStore.config)

const activePlayers = computed(() => playerStore.activePlayers)
const allPlayers = computed(() => playerStore.all)
const womenCount = computed(() => allPlayers.value.filter((p) => p.gender === 'W').length)
const menCount = computed(() => allPlayers.value.filter((p) => p.gender === 'M').length)

const finishedRounds = computed(() => roundStore.all.filter((r) => r.status === 'finished').length)
const pendingRounds = computed(() => roundStore.all.filter((r) => r.status === 'pending').length)
const totalRounds = computed(() => roundStore.all.length)

const showFinishConfirm = ref(false)

function finishTournament() {
  tournamentStore.finish()
  router.push('/setup')
}
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
    <div v-if="!tournament" class="text-center text-stone-400 py-12">
      Kein aktives Turnier
    </div>

    <template v-else>
      <!-- Tournament name & status -->
      <div class="bg-white rounded-2xl border border-stone-200 p-5">
        <h2 class="text-xl font-bold text-stone-800">{{ tournament.name }}</h2>
        <p class="text-sm text-stone-500 mt-1">
          Gestartet: {{ new Date(tournament.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
        </p>
        <span
          :class="[
            'inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold',
            tournament.status === 'running' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500',
          ]"
        >
          {{ tournament.status === 'running' ? 'Läuft' : 'Beendet' }}
        </span>
      </div>

      <!-- Config -->
      <div class="bg-white rounded-2xl border border-stone-200 p-5">
        <h3 class="font-semibold text-stone-700 mb-4">Einstellungen</h3>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-amber-50 rounded-xl p-3 text-center">
            <p class="text-2xl font-bold text-amber-700">{{ config?.teamSize }}v{{ config?.teamSize }}</p>
            <p class="text-xs text-stone-500 mt-1">Teamgröße</p>
          </div>
          <div class="bg-amber-50 rounded-xl p-3 text-center">
            <p class="text-2xl font-bold text-amber-700">{{ config?.setsPerMatch ?? 2 }}</p>
            <p class="text-xs text-stone-500 mt-1">Sätze pro Spiel</p>
          </div>
          <div class="bg-amber-50 rounded-xl p-3 text-center">
            <p class="text-2xl font-bold text-amber-700">{{ config?.minGamesPerPlayer }}</p>
            <p class="text-xs text-stone-500 mt-1">Mindestspiele</p>
          </div>
          <div class="bg-amber-50 rounded-xl p-3 text-center">
            <p class="text-2xl font-bold text-amber-700">{{ config?.courtCount }}</p>
            <p class="text-xs text-stone-500 mt-1">Felder</p>
          </div>
        </div>
      </div>

      <!-- Rounds progress -->
      <div class="bg-white rounded-2xl border border-stone-200 p-5">
        <h3 class="font-semibold text-stone-700 mb-4">Runden</h3>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div>
            <p class="text-2xl font-bold text-stone-800">{{ finishedRounds }}</p>
            <p class="text-xs text-stone-500 mt-1">Abgeschlossen</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-amber-600">{{ totalRounds - finishedRounds - pendingRounds > 0 ? 1 : 0 }}</p>
            <p class="text-xs text-stone-500 mt-1">Aktiv</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-stone-400">{{ pendingRounds }}</p>
            <p class="text-xs text-stone-500 mt-1">Ausstehend</p>
          </div>
        </div>
      </div>

      <!-- Players -->
      <div class="bg-white rounded-2xl border border-stone-200 p-5">
        <h3 class="font-semibold text-stone-700 mb-1">Spieler</h3>
        <p class="text-sm text-stone-500 mb-4">
          {{ activePlayers.length }} aktiv · {{ allPlayers.length - activePlayers.length }} inaktiv ·
          {{ womenCount }} W / {{ menCount }} M
        </p>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="p in allPlayers"
            :key="p.id"
            :class="[
              'flex items-center gap-1 rounded-full px-3 py-1.5 text-sm',
              p.active ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-400 line-through',
            ]"
          >
            <span
              :class="[
                'text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center',
                p.gender === 'W' ? 'bg-pink-300 text-white' : p.gender === 'M' ? 'bg-blue-300 text-white' : 'bg-stone-200 text-stone-500',
              ]"
            >{{ p.gender ?? '?' }}</span>
            {{ p.name }}
          </div>
        </div>
      </div>

      <AppButton variant="ghost" full-width @click="showFinishConfirm = true">
        Turnier beenden
      </AppButton>
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
