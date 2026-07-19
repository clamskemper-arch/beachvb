import { defineStore } from 'pinia'
import type { Round, Team, RoundID, RoundStatus } from '../types'
import { generateRound, createPairingHistory, recordMatchup } from '../algorithms/teamGenerator'
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
    // Generates one round with the given number/status from the current roster and
    // the pairing/sit-out history of the finished (+ active) rounds still in state.
    // Returns false without side effects if generation isn't possible right now.
    createRound(roundNumber: number, status: RoundStatus): boolean {
      const playerStore = usePlayerStore()
      const matchStore = useMatchStore()
      const tournamentStore = useTournamentStore()

      const config = tournamentStore.config
      if (!config) return false

      const activePlayers = playerStore.activePlayers.map((p) => p.id)
      if (activePlayers.length < config.teamSize * 2) return false

      const finishedRounds = Object.values(this.rounds)
        .filter((r) => r.status === 'finished')
        .sort((a, b) => a.number - b.number)

      const sitOutCounts: Record<string, number> = {}
      finishedRounds.forEach((r) => {
        r.sittingOutPlayerIds.forEach((pid) => {
          sitOutCounts[pid] = (sitOutCounts[pid] ?? 0) + 1
        })
      })

      // Build teammate/opponent history from finished and the currently active round,
      // so the newly generated round avoids repeating past pairings where possible.
      const history = createPairingHistory()
      Object.values(this.rounds)
        .filter((r) => r.status === 'finished' || r.status === 'active')
        .forEach((r) => {
          r.matchIds.forEach((matchId) => {
            const match = matchStore.byId(matchId)
            if (!match) return
            const teamA = this.teams[match.teamAId]
            const teamB = this.teams[match.teamBId]
            if (!teamA || !teamB) return
            recordMatchup(history, teamA.playerIds, teamB.playerIds)
          })
        })

      const lastSittingOut = finishedRounds[finishedRounds.length - 1]?.sittingOutPlayerIds ?? []

      const genders: Record<string, 'M' | 'W' | null> = {}
      playerStore.activePlayers.forEach((p) => { genders[p.id] = p.gender })

      const { teams: teamGroups, sittingOut } = generateRound(
        activePlayers,
        config.teamSize,
        sitOutCounts,
        lastSittingOut,
        genders,
        config.courtCount,
        history,
      )

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
        status,
        matchIds,
        sittingOutPlayerIds: sittingOut,
        activePlayerSnapshot: activePlayers,
      }
      tournamentStore.addRound(roundId)
      return true
    },

    deleteRound(round: Round) {
      const matchStore = useMatchStore()
      const tournamentStore = useTournamentStore()

      round.matchIds.forEach((mid) => matchStore.deleteMatch(mid))
      Object.keys(this.teams).forEach((tid) => {
        if (this.teams[tid].roundId === round.id) delete this.teams[tid]
      })
      tournamentStore.removeRound(round.id)
      delete this.rounds[round.id]
    },

    // Deletes any still-pending round and generates exactly one new one.
    schedulePendingRounds() {
      const tournamentStore = useTournamentStore()
      const playerStore = usePlayerStore()

      const config = tournamentStore.config
      if (!config) return
      if (playerStore.activePlayers.length < config.teamSize * 2) return

      Object.values(this.rounds)
        .filter((r) => r.status === 'pending')
        .forEach((r) => this.deleteRound(r))

      const finishedCount = Object.values(this.rounds).filter((r) => r.status === 'finished').length
      const created = this.createRound(finishedCount + 1, 'pending')

      if (created && !this.currentRound) this.activateNextPending()
    },

    // Deletes the currently active round (including any already-entered scores)
    // and regenerates it fresh under the same round number.
    regenerateCurrentRound() {
      const current = this.currentRound
      if (!current) return

      const tournamentStore = useTournamentStore()
      const playerStore = usePlayerStore()

      const config = tournamentStore.config
      if (!config) return
      if (playerStore.activePlayers.length < config.teamSize * 2) return

      const roundNumber = current.number
      this.deleteRound(current)
      this.createRound(roundNumber, 'active')
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
        return
      }

      // No round queued up: generate the next one automatically, unless every
      // active player has already reached the minimum games target.
      const playerStore = usePlayerStore()
      const tournamentStore = useTournamentStore()
      const config = tournamentStore.config
      const activePlayers = playerStore.activePlayers.map((p) => p.id)
      const base = Math.max(1, config?.minGamesPerPlayer ?? 1)

      const gamesPlayed: Record<string, number> = {}
      Object.values(this.rounds)
        .filter((r) => r.status === 'finished')
        .forEach((r) => {
          const sittingSet = new Set(r.sittingOutPlayerIds)
          r.activePlayerSnapshot.forEach((pid) => {
            if (!sittingSet.has(pid)) gamesPlayed[pid] = (gamesPlayed[pid] ?? 0) + 1
          })
        })
      const targetReached = activePlayers.every((pid) => (gamesPlayed[pid] ?? 0) >= base)

      if (config && !targetReached) {
        this.schedulePendingRounds()
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
