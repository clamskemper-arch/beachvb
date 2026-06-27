import { defineStore } from 'pinia'
import type { Round, Team, RoundID } from '../types'
import { generateRound } from '../algorithms/teamGenerator'
import { usePlayerStore } from './player'
import { useMatchStore } from './match'
import { useTournamentStore } from './tournament'

interface RoundState {
  rounds: Record<RoundID, Round>
  teams: Record<string, Team>
}

export const useRoundStore = defineStore('rounds', {
  state: (): RoundState => ({
    rounds: {},
    teams: {},
  }),

  getters: {
    all: (state) => Object.values(state.rounds).sort((a, b) => a.number - b.number),
    currentRound(state): Round | null {
      const all = Object.values(state.rounds)
      if (!all.length) return null
      return all.reduce((a, b) => (a.number > b.number ? a : b))
    },
    teamById: (state) => (id: string) => state.teams[id],
  },

  actions: {
    generate(sitOutCounts: Record<string, number>) {
      const playerStore = usePlayerStore()
      const matchStore = useMatchStore()
      const tournamentStore = useTournamentStore()

      const config = tournamentStore.config
      if (!config) return

      const activePlayers = playerStore.activePlayers.map((p) => p.id)
      if (activePlayers.length < config.teamSize * 2) return

      const { teams: teamGroups, sittingOut } = generateRound(
        activePlayers,
        config.teamSize,
        sitOutCounts,
      )

      const roundNumber = Object.values(this.rounds).length + 1
      const roundId = crypto.randomUUID()

      const createdTeams: Team[] = teamGroups.map((playerIds) => ({
        id: crypto.randomUUID(),
        roundId,
        playerIds,
      }))

      createdTeams.forEach((t) => {
        this.teams[t.id] = t
      })

      const matchIds: string[] = []
      for (let i = 0; i + 1 < createdTeams.length; i += 2) {
        const matchId = matchStore.create(roundId, createdTeams[i].id, createdTeams[i + 1].id)
        matchIds.push(matchId)
      }

      const round: Round = {
        id: roundId,
        number: roundNumber,
        status: 'active',
        matchIds,
        sittingOutPlayerIds: sittingOut,
        activePlayerSnapshot: activePlayers,
      }

      this.rounds[roundId] = round
      tournamentStore.addRound(roundId)

      return roundId
    },

    finishRound(roundId: RoundID) {
      const round = this.rounds[roundId]
      if (round) round.status = 'finished'
    },

    reset() {
      this.rounds = {}
      this.teams = {}
    },
  },
})
