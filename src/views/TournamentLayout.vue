<script setup lang="ts">
import TabBar from '../components/ui/TabBar.vue'
import { useTournamentStore } from '../stores/tournament'

const tournamentStore = useTournamentStore()
</script>

<template>
  <div class="flex flex-col h-full min-h-screen bg-amber-50">
    <header class="bg-amber-500 text-white px-4 py-3 flex items-center gap-3 shadow-sm">
      <span class="text-xl">🏐</span>
      <h1 class="font-bold text-lg truncate">{{ tournamentStore.tournament?.name }}</h1>
    </header>

    <main class="flex-1 overflow-y-auto p-4">
      <RouterView />
    </main>

    <TabBar />
  </div>
</template>
