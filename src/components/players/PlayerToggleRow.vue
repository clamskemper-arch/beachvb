<script setup lang="ts">
import AppBadge from '../ui/AppBadge.vue'
import type { Player } from '../../types'

defineProps<{ player: Player }>()
const emit = defineEmits<{ toggle: [id: string] }>()
</script>

<template>
  <div class="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0">
    <div class="flex-1">
      <span :class="['font-medium', !player.active ? 'text-stone-400 line-through' : 'text-stone-800']">
        {{ player.name }}
      </span>
      <AppBadge v-if="player.joinedAfterRound !== null" variant="info" class="ml-2">
        ab Runde {{ player.joinedAfterRound + 1 }}
      </AppBadge>
    </div>

    <button
      :class="[
        'relative inline-flex h-7 w-13 items-center rounded-full transition-colors min-w-13',
        player.active ? 'bg-amber-500' : 'bg-stone-300',
      ]"
      @click="emit('toggle', player.id)"
    >
      <span
        :class="[
          'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
          player.active ? 'translate-x-7' : 'translate-x-1',
        ]"
      />
    </button>
  </div>
</template>
