<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '../components/ui/AppButton.vue'
import AppCard from '../components/ui/AppCard.vue'
import { useTournamentStore } from '../stores/tournament'
import { usePlayerStore } from '../stores/player'
import { useRoundStore } from '../stores/round'
import { useMatchStore } from '../stores/match'
import { sortPlayersByGenderThenName } from '../utils/sortPlayers'

const router = useRouter()
const tournamentStore = useTournamentStore()
const playerStore = usePlayerStore()
const roundStore = useRoundStore()
const matchStore = useMatchStore()

const name = ref('Mein Turnier')
const newPlayerName = ref('')
const teamSize = ref<2 | 3 | 4>(2)
const setsPerMatch = ref(2)
const minGames = ref(3)
const courtCount = ref(2)

interface LocalPlayer { name: string; gender: 'M' | 'W' | null }
const localPlayers = ref<LocalPlayer[]>(
  playerStore.all.map((p) => ({ name: p.name, gender: p.gender })),
)
const newPlayerGender = ref<'M' | 'W'>('W')

function addPlayer() {
  const n = newPlayerName.value.trim()
  if (!n || localPlayers.value.some((p) => p.name === n)) return
  localPlayers.value.push({ name: n, gender: newPlayerGender.value })
  newPlayerName.value = ''
}

function removePlayer(i: number) {
  localPlayers.value.splice(i, 1)
}

function cycleGender(i: number) {
  const g = localPlayers.value[i].gender
  localPlayers.value[i].gender = g === null ? 'M' : g === 'M' ? 'W' : null
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') addPlayer()
}

const sortedLocalPlayers = computed(() =>
  sortPlayersByGenderThenName(localPlayers.value.map((p, i) => ({ ...p, i }))),
)

const minRequired = computed(() => teamSize.value * 2)
const canStart = computed(() => name.value.trim() && localPlayers.value.length >= minRequired.value)

function startTournament() {
  // Reset all stores
  tournamentStore.reset()
  playerStore.reset()
  roundStore.reset()
  matchStore.reset()

  const playerIds: string[] = []
  for (const lp of localPlayers.value) {
    const p = playerStore.add(lp.name, null, lp.gender)
    playerIds.push(p.id)
  }

  tournamentStore.create(name.value.trim(), {
    teamSize: teamSize.value,
    setsPerMatch: setsPerMatch.value,
    minGamesPerPlayer: minGames.value,
    courtCount: courtCount.value,
  }, playerIds)

  router.push('/tournament/active')
}
</script>

<template>
  <div class="min-h-screen bg-amber-50 flex flex-col">
    <header class="bg-amber-500 text-white px-4 py-4">
      <h1 class="text-2xl font-bold">🏐 Beach Volleyball</h1>
      <p class="text-amber-100 text-sm">Turnier einrichten</p>
    </header>

    <main class="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
      <!-- Name -->
      <AppCard title="Turniernahme">
        <input
          v-model="name"
          type="text"
          class="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none text-stone-800 text-base"
          placeholder="z.B. Sommerfest 2025"
        />
      </AppCard>

      <!-- Players -->
      <AppCard title="Spieler">
        <div class="flex gap-2 mb-3">
          <input
            v-model="newPlayerName"
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
              newPlayerGender === g
                ? g === 'M' ? 'bg-blue-400 border-blue-400 text-white' : 'bg-pink-400 border-pink-400 text-white'
                : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300',
            ]"
            @click="newPlayerGender = g"
          >{{ g }}</button>
          <AppButton @click="addPlayer">+</AppButton>
        </div>

        <div v-if="localPlayers.length === 0" class="text-stone-400 text-sm text-center py-4">
          Noch keine Spieler
        </div>

        <div v-else class="flex flex-wrap gap-2">
          <div
            v-for="p in sortedLocalPlayers"
            :key="p.i"
            class="flex items-center gap-1 bg-amber-100 rounded-full pl-3 pr-1.5 py-1.5"
          >
            <span class="text-amber-800 font-medium text-sm">{{ p.name }}</span>
            <button
              :class="[
                'text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-colors ml-1',
                p.gender === 'W' ? 'bg-pink-400 text-white' : p.gender === 'M' ? 'bg-blue-400 text-white' : 'bg-amber-200 text-amber-600',
              ]"
              :title="p.gender === null ? 'Geschlecht festlegen' : p.gender === 'M' ? 'Männlich → Weiblich' : 'Weiblich → Keine Angabe'"
              @click="cycleGender(p.i)"
            >{{ p.gender ?? '?' }}</button>
            <button
              class="text-amber-600 hover:text-red-500 w-6 h-6 flex items-center justify-center text-lg leading-none"
              @click="removePlayer(p.i)"
            >×</button>
          </div>
        </div>

        <div class="flex items-center justify-between mt-2">
          <p class="text-xs text-stone-400">
            {{ localPlayers.length }} Spieler · mindestens {{ minRequired }} benötigt
          </p>
          <button
            v-if="localPlayers.length > 0"
            class="text-xs text-red-400 hover:text-red-600 transition-colors"
            @click="localPlayers = []"
          >Alle entfernen</button>
        </div>
      </AppCard>

      <!-- Config -->
      <AppCard title="Einstellungen">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm font-medium text-stone-600 mb-2">Teamgröße</label>
            <div class="flex gap-2">
              <button
                v-for="s in [2, 3, 4]"
                :key="s"
                :class="[
                  'flex-1 py-3 rounded-xl font-bold border-2 text-lg transition-colors',
                  teamSize === s
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-amber-300',
                ]"
                @click="teamSize = s as 2 | 3 | 4"
              >{{ s }}v{{ s }}</button>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-2">Sätze/Spiel</label>
              <input
                v-model.number="setsPerMatch"
                type="number"
                min="1"
                max="10"
                class="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none text-stone-800 text-center text-lg font-bold"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-2">Mindestspiele</label>
              <input
                v-model.number="minGames"
                type="number"
                min="1"
                max="50"
                class="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none text-stone-800 text-center text-lg font-bold"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-600 mb-2">Felder</label>
              <input
                v-model.number="courtCount"
                type="number"
                min="1"
                max="20"
                class="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none text-stone-800 text-center text-lg font-bold"
              />
            </div>
          </div>
        </div>
      </AppCard>

      <div class="pb-4">
        <AppButton :disabled="!canStart" full-width size="lg" @click="startTournament">
          Turnier starten →
        </AppButton>
        <p v-if="!canStart && localPlayers.length < minRequired" class="text-xs text-red-400 text-center mt-2">
          Mindestens {{ minRequired }} Spieler für {{ teamSize }}v{{ teamSize }} benötigt
        </p>
      </div>
    </main>
  </div>
</template>
