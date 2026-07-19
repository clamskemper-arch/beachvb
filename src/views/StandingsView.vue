<script setup lang="ts">
import { computed } from 'vue'
import AppCard from '../components/ui/AppCard.vue'
import StandingsTable from '../components/standings/StandingsTable.vue'
import { usePlayerStats } from '../composables/usePlayerStats'
import { usePlayerStore } from '../stores/player'

const { sorted } = usePlayerStats()
const playerStore = usePlayerStore()

const visible = computed(() => sorted.value.filter((s) => !s.hiddenInStandings))
const hidden = computed(() => sorted.value.filter((s) => s.hiddenInStandings))
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-lg font-bold text-stone-800">Tabelle</h2>

    <AppCard>
      <StandingsTable :stats="visible" @hide="playerStore.setHiddenInStandings($event, true)" />
    </AppCard>

    <AppCard v-if="hidden.length > 0" title="Ausgeblendete Spieler">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="p in hidden"
          :key="p.playerId"
          class="flex items-center gap-1 bg-stone-100 rounded-full pl-3 pr-1.5 py-1.5"
        >
          <span class="text-stone-600 text-sm">{{ p.name }}</span>
          <button
            class="text-stone-400 hover:text-amber-600 w-6 h-6 flex items-center justify-center text-xs rounded-full transition-colors"
            title="Wieder einblenden"
            @click="playerStore.setHiddenInStandings(p.playerId, false)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3C5.5 3 1.7 5.9.5 10c1.2 4.1 5 7 9.5 7s8.3-2.9 9.5-7C18.3 5.9 14.5 3 10 3zm0 11.5A4.5 4.5 0 1110 5.5a4.5 4.5 0 010 9z" />
              <path d="M10 8a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </button>
        </div>
      </div>
    </AppCard>
  </div>
</template>
