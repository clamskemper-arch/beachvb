<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AppButton from '../ui/AppButton.vue'
import type { Match, SetResult } from '../../types'
import { useRoundStore } from '../../stores/round'
import { usePlayerStore } from '../../stores/player'
import { useMatchStore } from '../../stores/match'
import { useTournamentStore } from '../../stores/tournament'

const props = defineProps<{ match: Match }>()
const emit = defineEmits<{ confirmed: [] }>()

const roundStore = useRoundStore()
const playerStore = usePlayerStore()
const matchStore = useMatchStore()
const tournamentStore = useTournamentStore()

const setsPerMatch = computed(() => tournamentStore.config?.setsPerMatch ?? 2)
const pointsPerSet = computed(() => tournamentStore.config?.pointsPerSet ?? 21)

const sets = ref<SetResult[]>([])

function resetSets() {
  if (props.match.sets?.length) {
    sets.value = props.match.sets.map((s) => ({ ...s }))
  } else {
    sets.value = Array.from({ length: setsPerMatch.value }, () => ({ scoreA: 0, scoreB: 0 }))
  }
}

watch(() => props.match.id, resetSets, { immediate: true })
watch(setsPerMatch, resetSets)

function teamNames(teamId: string): string {
  const team = roundStore.teamById(teamId)
  if (!team) return ''
  return team.playerIds.map((id) => playerStore.byId(id)?.name ?? '?').join(' & ')
}

const nameA = computed(() => teamNames(props.match.teamAId))
const nameB = computed(() => teamNames(props.match.teamBId))

const setsWonA = computed(() => sets.value.filter((s) => s.scoreA > s.scoreB).length)
const setsWonB = computed(() => sets.value.filter((s) => s.scoreB > s.scoreA).length)

const canConfirm = computed(() => sets.value.every((s) => s.scoreA + s.scoreB > 0))

function clamp(val: number) { return Math.max(0, val) }

function confirm() {
  matchStore.confirm(props.match.id, sets.value)
  emit('confirmed')
}
</script>

<template>
  <div class="bg-white rounded-2xl border-2 border-amber-200 p-4">
    <!-- Team names header -->
    <div class="grid grid-cols-[1fr_60px_1fr] items-center gap-2 mb-4">
      <p class="text-center font-semibold text-stone-800 text-sm leading-tight">{{ nameA }}</p>
      <p class="text-center text-stone-400 text-xs font-medium">vs</p>
      <p class="text-center font-semibold text-stone-800 text-sm leading-tight">{{ nameB }}</p>
    </div>

    <!-- Set rows -->
    <div
      v-for="(s, i) in sets"
      :key="i"
      class="grid grid-cols-[1fr_60px_1fr] items-center gap-2 mb-3"
    >
      <!-- Team A set score -->
      <div class="flex items-center justify-center gap-1">
        <button
          class="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 font-bold text-lg hover:bg-amber-100 active:bg-amber-200 transition-colors"
          @click="s.scoreA = clamp(s.scoreA - 1)"
        >−</button>
        <input
          v-model.number="s.scoreA"
          type="number"
          min="0"
          class="w-12 h-10 text-center font-bold text-xl text-stone-800 border-2 border-stone-200 rounded-xl focus:border-amber-400 outline-none"
          @change="s.scoreA = clamp(s.scoreA)"
        />
        <button
          class="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 font-bold text-lg hover:bg-amber-100 active:bg-amber-200 transition-colors"
          @click="s.scoreA++"
        >+</button>
        <button
          class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 font-bold text-sm hover:bg-amber-200 active:bg-amber-300 transition-colors"
          :title="`Direkt auf ${pointsPerSet} setzen`"
          @click="s.scoreA = pointsPerSet"
        >{{ pointsPerSet }}</button>
      </div>

      <!-- Set label -->
      <p class="text-center text-xs text-stone-400 font-semibold uppercase tracking-wide">
        Satz {{ i + 1 }}
      </p>

      <!-- Team B set score -->
      <div class="flex items-center justify-center gap-1">
        <button
          class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 font-bold text-sm hover:bg-amber-200 active:bg-amber-300 transition-colors"
          :title="`Direkt auf ${pointsPerSet} setzen`"
          @click="s.scoreB = pointsPerSet"
        >{{ pointsPerSet }}</button>
        <button
          class="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 font-bold text-lg hover:bg-amber-100 active:bg-amber-200 transition-colors"
          @click="s.scoreB = clamp(s.scoreB - 1)"
        >−</button>
        <input
          v-model.number="s.scoreB"
          type="number"
          min="0"
          class="w-12 h-10 text-center font-bold text-xl text-stone-800 border-2 border-stone-200 rounded-xl focus:border-amber-400 outline-none"
          @change="s.scoreB = clamp(s.scoreB)"
        />
        <button
          class="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 font-bold text-lg hover:bg-amber-100 active:bg-amber-200 transition-colors"
          @click="s.scoreB++"
        >+</button>
      </div>
    </div>

    <!-- Sets-won summary -->
    <div class="flex items-center justify-center gap-3 py-3 mb-4 bg-stone-50 rounded-xl">
      <span class="font-bold text-3xl text-stone-800">{{ setsWonA }}</span>
      <span class="text-stone-400 text-sm font-medium">Sätze</span>
      <span class="font-bold text-3xl text-stone-800">{{ setsWonB }}</span>
    </div>

    <AppButton :disabled="!canConfirm" full-width size="lg" @click="confirm">
      {{ match.finishedAt ? 'Ergebnis aktualisieren' : 'Ergebnis speichern' }}
    </AppButton>
  </div>
</template>
