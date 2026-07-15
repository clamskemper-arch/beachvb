import { defineStore } from 'pinia'
import type { Round, Team, RoundID } from '../types'
import { generateRound } from '../algorithms/teamGenerator'
import { usePlayerStore } from './player'
import { useMatchStore } from './match'
import { useTournamentStore } from './tournament'
import router from '../router'

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
      return Object.values(state.rounds).find((r) => r.status === 'active') ?? null
    },
    pendingRounds(state): Round[] {
      return Object.values(state.rounds)
        .filter((r) => r.status === 'pending')
        .sort((a, b) => a.number - b.number)
    },
    teamById: (state) => (id: string) => state.teams[id],
  },

  actions: {
    schedulePendingRounds(extend = false) {
      const playerStore = usePlayerStore()
      const matchStore = useMatchStore()
      const tournamentStore = useTournamentStore()

      const config = tournamentStore.config
      if (!config) return

      const activePlayers = playerStore.activePlayers.map((p) => p.id)
      if (activePlayers.length < config.teamSize * 2) return

      // Delete all existing pending rounds
      Object.values(this.rounds)
        .filter((r) => r.status === 'pending')
        .forEach((r) => {
          r.matchIds.forEach((mid) => matchStore.deleteMatch(mid))
          Object.keys(this.teams).forEach((tid) => {
            if (this.teams[tid].roundId === r.id) delete this.teams[tid]
          })
          tournamentStore.removeRound(r.id)
          delete this.rounds[r.id]
        })

      // Build state from finished rounds
      const finishedRounds = Object.values(this.rounds)
        .filter((r) => r.status === 'finished')
        .sort((a, b) => a.number - b.number)

      const gamesPlayed: Record<string, number> = {}
      const sitOutCounts: Record<string, number> = {}

      finishedRounds.forEach((r) => {
        const sittingSet = new Set(r.sittingOutPlayerIds)
        r.activePlayerSnapshot.forEach((pid) => {
          if (!sittingSet.has(pid)) gamesPlayed[pid] = (gamesPlayed[pid] ?? 0) + 1
        })
        r.sittingOutPlayerIds.forEach((pid) => {
          sitOutCounts[pid] = (sitOutCounts[pid] ?? 0) + 1
        })
      })

      activePlayers.forEach((pid) => { if (!(pid in gamesPlayed)) gamesPlayed[pid] = 0 })

      const base = Math.max(1, config.minGamesPerPlayer)

      let lastSittingOut = finishedRounds[finishedRounds.length - 1]?.sittingOutPlayerIds ?? []
      let roundNumber = finishedRounds.length + 1

      // extend: append exactly one more round (sit-out/games fairness carries over from finished rounds)
      // otherwise: generate rounds until all active players have reached the minimum
      const maxIterations = extend ? 1 : 100
      for (let i = 0; i < maxIterations; i++) {
        if (!extend && activePlayers.every((pid) => (gamesPlayed[pid] ?? 0) >= base)) break

        const genders: Record<string, 'M' | 'W' | null> = {}
        playerStore.activePlayers.forEach((p) => { genders[p.id] = p.gender })

        const { teams: teamGroups, sittingOut } = generateRound(
          activePlayers,
          config.teamSize,
          sitOutCounts,
          lastSittingOut,
          genders,
          config.courtCount,
        )

        const sittingSet = new Set(sittingOut)
        activePlayers.forEach((pid) => {
          if (!sittingSet.has(pid)) gamesPlayed[pid] = (gamesPlayed[pid] ?? 0) + 1
        })
        sittingOut.forEach((pid) => { sitOutCounts[pid] = (sitOutCounts[pid] ?? 0) + 1 })
        lastSittingOut = sittingOut

        const roundId = crypto.randomUUID()
        const createdTeams: Team[] = teamGroups.map((playerIds) => ({
          id: crypto.randomUUID(),
          roundId,
          playerIds,
        }))
        createdTeams.forEach((t) => { this.teams[t.id] = t })

        const matchIds: string[] = []
        for (let j = 0; j + 1 < createdTeams.length; j += 2) {
          matchIds.push(matchStore.create(roundId, createdTeams[j].id, createdTeams[j + 1].id))
        }

        this.rounds[roundId] = {
          id: roundId,
          number: roundNumber,
          status: 'pending',
          matchIds,
          sittingOutPlayerIds: sittingOut,
          activePlayerSnapshot: activePlayers,
        }
        tournamentStore.addRound(roundId)
        roundNumber++
      }

      // Activate first pending round if none is active
      if (!this.currentRound) this.activateNextPending()
    },

    activateNextPending() {
      const first = Object.values(this.rounds)
        .filter((r) => r.status === 'pending')
        .sort((a, b) => a.number - b.number)[0]

      if (first) {
        first.status = 'active'
        router.push('/tournament/active')
      }
    },

    finishRound(roundId: RoundID) {
      const round = this.rounds[roundId]
      if (!round) return
      round.status = 'finished'

      const hasPending = Object.values(this.rounds).some((r) => r.status === 'pending')
      if (hasPending) {
        this.activateNextPending()
      } else {
        router.push('/tournament/active')
      }
    },

    reset() {
      this.rounds = {}
      this.teams = {}
    },
  },
})
