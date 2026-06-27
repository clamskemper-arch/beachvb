import { defineStore } from 'pinia'
import type { Match, MatchID, RoundID } from '../types'
import { useRoundStore } from './round'

interface MatchState {
  matches: Record<MatchID, Match>
}

export const useMatchStore = defineStore('matches', {
  state: (): MatchState => ({
    matches: {},
  }),

  getters: {
    byRound: (state) => (roundId: RoundID) =>
      Object.values(state.matches).filter((m) => m.roundId === roundId),
    byId: (state) => (id: MatchID) => state.matches[id],
    pendingInRound: (state) => (roundId: RoundID) =>
      Object.values(state.matches).filter(
        (m) => m.roundId === roundId && m.finishedAt === null,
      ),
    allFinishedInRound: (state) => (roundId: RoundID) => {
      const roundMatches = Object.values(state.matches).filter((m) => m.roundId === roundId)
      return roundMatches.length > 0 && roundMatches.every((m) => m.finishedAt !== null)
    },
  },

  actions: {
    create(roundId: RoundID, teamAId: string, teamBId: string): MatchID {
      const match: Match = {
        id: crypto.randomUUID(),
        roundId,
        teamAId,
        teamBId,
        scoreA: null,
        scoreB: null,
        finishedAt: null,
      }
      this.matches[match.id] = match
      return match.id
    },

    confirm(matchId: MatchID, scoreA: number, scoreB: number) {
      const match = this.matches[matchId]
      if (!match) return
      match.scoreA = scoreA
      match.scoreB = scoreB
      match.finishedAt = Date.now()

      const roundStore = useRoundStore()
      if (roundStore.rounds[match.roundId]) {
        const allDone = Object.values(this.matches)
          .filter((m) => m.roundId === match.roundId)
          .every((m) => m.finishedAt !== null)
        if (allDone) {
          roundStore.finishRound(match.roundId)
        }
      }
    },

    reset() {
      this.matches = {}
    },
  },
})
