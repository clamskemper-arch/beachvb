import { computed, type Ref } from 'vue'
import type { SetResult } from '../types'
import { usePlayerStore } from '../stores/player'
import { useRoundStore } from '../stores/round'
import { useMatchStore } from '../stores/match'

export interface PlayerMatchEntry {
  matchId: string
  roundNumber: number
  teammates: string[]
  opponents: string[]
  sets: SetResult[]
  mySetsWon: number | null
  opponentSetsWon: number | null
  result: 'win' | 'loss' | 'draw' | null
  finished: boolean
  amTeamA: boolean
}

export function usePlayerMatches(playerId: Ref<string | null>) {
  const playerStore = usePlayerStore()
  const roundStore = useRoundStore()
  const matchStore = useMatchStore()

  const matches = computed<PlayerMatchEntry[]>(() => {
    const pid = playerId.value
    if (!pid) return []

    const entries: PlayerMatchEntry[] = []
    for (const round of roundStore.all) {
      for (const matchId of round.matchIds) {
        const match = matchStore.byId(matchId)
        if (!match) continue

        const teamA = roundStore.teamById(match.teamAId)
        const teamB = roundStore.teamById(match.teamBId)
        if (!teamA || !teamB) continue

        const amTeamA = teamA.playerIds.includes(pid)
        const amTeamB = teamB.playerIds.includes(pid)
        if (!amTeamA && !amTeamB) continue

        const myTeam = amTeamA ? teamA : teamB
        const oppTeam = amTeamA ? teamB : teamA
        const teammates = myTeam.playerIds
          .filter((id) => id !== pid)
          .map((id) => playerStore.byId(id)?.name ?? '?')
        const opponents = oppTeam.playerIds.map((id) => playerStore.byId(id)?.name ?? '?')

        const mySetsWon = match.finishedAt !== null ? (amTeamA ? match.scoreA : match.scoreB) : null
        const opponentSetsWon = match.finishedAt !== null ? (amTeamA ? match.scoreB : match.scoreA) : null

        let result: 'win' | 'loss' | 'draw' | null = null
        if (mySetsWon !== null && opponentSetsWon !== null) {
          result = mySetsWon > opponentSetsWon ? 'win' : mySetsWon < opponentSetsWon ? 'loss' : 'draw'
        }

        entries.push({
          matchId,
          roundNumber: round.number,
          teammates,
          opponents,
          sets: match.sets ?? [],
          mySetsWon,
          opponentSetsWon,
          result,
          finished: match.finishedAt !== null,
          amTeamA,
        })
      }
    }

    return entries.sort((a, b) => b.roundNumber - a.roundNumber)
  })

  return { matches }
}
