import { defineStore } from 'pinia'
import type { Tournament, TournamentConfig } from '../types'

interface TournamentState {
  tournament: Tournament | null
}

export const useTournamentStore = defineStore('tournament', {
  state: (): TournamentState => ({
    tournament: null,
  }),

  getters: {
    isRunning: (state) => state.tournament?.status === 'running',
    config: (state) => state.tournament?.config ?? null,
  },

  actions: {
    create(name: string, config: TournamentConfig, playerIds: string[]) {
      this.tournament = {
        id: crypto.randomUUID(),
        name,
        config,
        playerIds,
        roundIds: [],
        status: 'running',
        createdAt: Date.now(),
      }
    },

    addRound(roundId: string) {
      this.tournament?.roundIds.push(roundId)
    },

    removeRound(roundId: string) {
      if (this.tournament) {
        this.tournament.roundIds = this.tournament.roundIds.filter((id) => id !== roundId)
      }
    },

    addPlayer(playerId: string) {
      this.tournament?.playerIds.push(playerId)
    },

    removePlayer(playerId: string) {
      if (this.tournament) {
        this.tournament.playerIds = this.tournament.playerIds.filter((id) => id !== playerId)
      }
    },

    finish() {
      if (this.tournament) this.tournament.status = 'finished'
    },

    reset() {
      this.tournament = null
    },
  },
})
