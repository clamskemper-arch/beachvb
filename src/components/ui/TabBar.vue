<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { label: 'Aktiv', path: '/tournament/active', icon: '🏐' },
  { label: 'Ergebnisse', path: '/tournament/scores', icon: '✏️' },
  { label: 'Spieler', path: '/tournament/players', icon: '👥' },
  { label: 'Runden', path: '/tournament/rounds', icon: '📋' },
  { label: 'Tabelle', path: '/tournament/standings', icon: '🏆' },
]
</script>

<template>
  <nav class="flex border-t border-stone-200 bg-white">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      :class="[
        'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors min-h-16',
        route.path === tab.path
          ? 'text-amber-600 border-t-2 border-amber-500 -mt-px'
          : 'text-stone-500 hover:text-stone-700',
      ]"
    >
      <span class="text-xl leading-none">{{ tab.icon }}</span>
      <span>{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>
