import { defineStore } from 'pinia'
import type { Player, PlayerID } from '../types'
import { sortPlayersByGenderThenName } from '../utils/sortPlayers'

interface PlayerState {
  players: Record<PlayerID, Player>
}

export const usePlayerStore = defineStore('players', {
  state: (): PlayerState => ({
    players: {},
  }),

  getters: {
    all: (state) => sortPlayersByGenderThenName(Object.values(state.players)),
    activePlayers: (state) => sortPlayersByGenderThenName(Object.values(state.players).filter((p) => p.active)),
    byId: (state) => (id: PlayerID) => state.players[id],
  },

  actions: {
    add(name: string, joinedAfterRound: number | null = null, gender: 'M' | 'W' | null = null): Player {
      const player: Player = {
        id: crypto.randomUUID(),
        name: name.trim(),
        createdAt: Date.now(),
        active: true,
        joinedAfterRound,
        gender,
        hiddenInStandings: false,
      }
      this.players[player.id] = player
      return player
    },

    setGender(id: PlayerID, gender: 'M' | 'W' | null) {
      const p = this.players[id]
      if (p) p.gender = gender
    },

    rename(id: PlayerID, name: string) {
      const trimmed = name.trim()
      if (!trimmed) return
      const p = this.players[id]
      if (p) p.name = trimmed
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

    setAllActive(active: boolean) {
      Object.values(this.players).forEach((p) => { p.active = active })
    },

    setHiddenInStandings(id: PlayerID, hidden: boolean) {
      const p = this.players[id]
      if (p) p.hiddenInStandings = hidden
    },

    reset() {
      this.players = {}
    },
  },
})
