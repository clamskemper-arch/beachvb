<script setup lang="ts">
import AppCard from '../components/ui/AppCard.vue'
import StandingsTable from '../components/standings/StandingsTable.vue'
import PlayerProgressBar from '../components/standings/PlayerProgressBar.vue'
import { usePlayerStats } from '../composables/usePlayerStats'
import { useTournamentStore } from '../stores/tournament'

const { sorted } = usePlayerStats()
const tournamentStore = useTournamentStore()
const minGames = tournamentStore.config?.minGamesPerPlayer ?? 3
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-lg font-bold text-stone-800">Tabelle</h2>

    <AppCard>
      <StandingsTable :stats="sorted" />
    </AppCard>

    <AppCard title="Mindestspiele-Fortschritt">
      <div class="flex flex-col gap-3">
        <PlayerProgressBar
          v-for="s in sorted"
          :key="s.playerId"
          :stats="s"
          :min-games="minGames"
        />
      </div>
    </AppCard>
  </div>
</template>
