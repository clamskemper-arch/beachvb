<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '../../stores/player'

const props = defineProps<{ playerIds: string[] }>()
const playerStore = usePlayerStore()
const names = computed(() => props.playerIds.map((id) => playerStore.byId(id)?.name ?? '?'))
</script>

<template>
  <div v-if="names.length" class="bg-stone-100 rounded-xl px-4 py-3 text-sm text-stone-600">
    <span class="font-medium">Pausiert diese Runde: </span>
    <span>{{ names.join(', ') }}</span>
  </div>
</template>
