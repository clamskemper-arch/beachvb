<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TeamScoreInput from './TeamScoreInput.vue'
import AppButton from '../ui/AppButton.vue'
import AppModal from '../ui/AppModal.vue'
import type { Match } from '../../types'
import { useRoundStore } from '../../stores/round'
import { usePlayerStore } from '../../stores/player'
import { useMatchStore } from '../../stores/match'

const props = defineProps<{ match: Match }>()
const emit = defineEmits<{ confirmed: [] }>()

const roundStore = useRoundStore()
const playerStore = usePlayerStore()
const matchStore = useMatchStore()

const scoreA = ref(0)
const scoreB = ref(0)
const showConfirm = ref(false)

watch(() => props.match.id, () => { scoreA.value = 0; scoreB.value = 0 }, { immediate: true })

function teamNames(teamId: string): string {
  const team = roundStore.teamById(teamId)
  if (!team) return ''
  return team.playerIds.map((id) => playerStore.byId(id)?.name ?? '?').join(' & ')
}

const nameA = computed(() => teamNames(props.match.teamAId))
const nameB = computed(() => teamNames(props.match.teamBId))
const canConfirm = computed(() => scoreA.value > 0 || scoreB.value > 0)

function confirm() {
  matchStore.confirm(props.match.id, scoreA.value, scoreB.value)
  showConfirm.value = false
  emit('confirmed')
}
</script>

<template>
  <div class="bg-white rounded-2xl border-2 border-amber-200 p-6">
    <div class="grid grid-cols-3 items-center gap-4">
      <TeamScoreInput :team-name="nameA" :score="scoreA" @update:score="scoreA = $event" />

      <div class="text-center">
        <span class="text-stone-400 text-xl font-light">vs</span>
      </div>

      <TeamScoreInput :team-name="nameB" :score="scoreB" @update:score="scoreB = $event" />
    </div>

    <div class="mt-6">
      <AppButton :disabled="!canConfirm" full-width size="lg" @click="showConfirm = true">
        Ergebnis bestätigen
      </AppButton>
    </div>
  </div>

  <AppModal title="Ergebnis speichern?" :show="showConfirm" @close="showConfirm = false">
    <p class="text-center text-2xl font-bold text-stone-800 my-2">
      {{ scoreA }} : {{ scoreB }}
    </p>
    <p class="text-center text-sm text-stone-500">{{ nameA }} vs {{ nameB }}</p>

    <template #footer>
      <AppButton variant="secondary" full-width @click="showConfirm = false">Abbrechen</AppButton>
      <AppButton full-width @click="confirm">Speichern</AppButton>
    </template>
  </AppModal>
</template>
