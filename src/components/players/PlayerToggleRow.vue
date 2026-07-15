<script setup lang="ts">
import { nextTick, ref } from 'vue'
import AppBadge from '../ui/AppBadge.vue'
import type { Player } from '../../types'

const props = defineProps<{ player: Player }>()
const emit = defineEmits<{ toggle: [id: string]; remove: [id: string]; setGender: [id: string, gender: 'M' | 'W' | null]; rename: [id: string, name: string] }>()

const editing = ref(false)
const editValue = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

async function startEdit() {
  editValue.value = props.player.name
  editing.value = true
  await nextTick()
  nameInput.value?.focus()
  nameInput.value?.select()
}

function commitEdit() {
  if (!editing.value) return
  editing.value = false
  const trimmed = editValue.value.trim()
  if (trimmed && trimmed !== props.player.name) emit('rename', props.player.id, trimmed)
}

function cancelEdit() {
  editing.value = false
}
</script>

<template>
  <div class="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0">
    <div class="flex-1">
      <input
        v-if="editing"
        ref="nameInput"
        v-model="editValue"
        type="text"
        class="w-full px-2 py-1 rounded-lg border-2 border-amber-400 outline-none text-stone-800 font-medium"
        @keydown.enter="commitEdit"
        @keydown.escape="cancelEdit"
        @blur="commitEdit"
      />
      <template v-else>
        <button
          type="button"
          :class="['font-medium text-left', !player.active ? 'text-stone-400 line-through' : 'text-stone-800']"
          title="Namen bearbeiten"
          @click="startEdit"
        >{{ player.name }}</button>
        <AppBadge v-if="player.joinedAfterRound !== null" variant="info" class="ml-2">
          ab Runde {{ player.joinedAfterRound + 1 }}
        </AppBadge>
      </template>
    </div>

    <div class="flex gap-1">
      <button
        v-for="g in (['W', 'M'] as const)"
        :key="g"
        :class="[
          'w-8 h-8 rounded-lg font-bold text-sm border-2 transition-colors',
          player.gender === g
            ? g === 'W' ? 'bg-pink-400 border-pink-400 text-white' : 'bg-blue-400 border-blue-400 text-white'
            : 'bg-white border-stone-200 text-stone-400 hover:border-stone-300',
        ]"
        @click="emit('setGender', player.id, g)"
      >{{ g }}</button>
    </div>

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
