<script setup lang="ts">
import AppCard from '../components/ui/AppCard.vue'
import StandingsTable from '../components/standings/StandingsTable.vue'
import { usePlayerStats } from '../composables/usePlayerStats'

const { sorted } = usePlayerStats()
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-lg font-bold text-stone-800">Tabelle</h2>

    <AppCard>
      <StandingsTable :stats="sorted" />
    </AppCard>
  </div>
</template>
