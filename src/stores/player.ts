import { defineStore } from 'pinia'
import type { Player, PlayerID } from '../types'

interface PlayerState {
  players: Record<PlayerID, Player>
}

export const usePlayerStore = defineStore('players', {
  state: (): PlayerState => ({
    players: {},
  }),

  getters: {
    all: (state) => Object.values(state.players),
    activePlayers: (state) => Object.values(state.players).filter((p) => p.active),
    byId: (state) => (id: PlayerID) => state.players[id],
  },

  actions: {
    add(name: string, joinedAfterRound: number | null = null): Player {
      const player: Player = {
        id: crypto.randomUUID(),
        name: name.trim(),
        createdAt: Date.now(),
        active: true,
        joinedAfterRound,
      }
      this.players[player.id] = player
      return player
    },

    remove(id: PlayerID) {
      delete this.players[id]
    },

    toggleActive(id: PlayerID) {
      const p = this.players[id]
      if (p) p.active = !p.active
    },

    setActive(id: PlayerID, active: boolean) {
      const p = this.players[id]
      if (p) p.active = active
    },

    reset() {
      this.players = {}
    },
  },
})
