<script setup lang="ts">
import AppBadge from '../ui/AppBadge.vue'
import type { Player } from '../../types'

defineProps<{ player: Player }>()
const emit = defineEmits<{ toggle: [id: string]; remove: [id: string]; setGender: [id: string, gender: 'M' | 'W' | null] }>()

function cycleGender(player: Player) {
  const next = player.gender === null ? 'M' : player.gender === 'M' ? 'W' : null
  emit('setGender', player.id, next)
}
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
        'text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center transition-colors',
        player.gender === 'W' ? 'bg-pink-400 text-white' : player.gender === 'M' ? 'bg-blue-400 text-white' : 'bg-stone-200 text-stone-500',
      ]"
      :title="player.gender === null ? 'Geschlecht festlegen' : player.gender === 'M' ? 'Männlich' : 'Weiblich'"
      @click="cycleGender(player)"
    >{{ player.gender ?? '?' }}</button>

    <div class="relative group">
      <button
        :class="[
          'relative inline-flex h-7 w-13 items-center rounded-full transition-colors min-w-13',
          player.active ? 'bg-amber-500' : 'bg-stone-300',
        ]"
        :aria-label="player.active ? 'Deaktivieren' : 'Aktivieren'"
        @click="emit('toggle', player.id)"
      >
        <span
          :class="[
            'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
            player.active ? 'translate-x-7' : 'translate-x-1',
          ]"
        />
      </button>
      <span class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-lg bg-stone-800 px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
        {{ player.active ? 'Deaktivieren' : 'Aktivieren' }}
      </span>
    </div>
    <button
      class="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      title="Spieler löschen"
      @click="emit('remove', player.id)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>
