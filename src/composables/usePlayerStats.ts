import { computed } from 'vue'
import type { PlayerStats } from '../types'
import { usePlayerStore } from '../stores/player'
import { useRoundStore } from '../stores/round'
import { useMatchStore } from '../stores/match'

export function usePlayerStats() {
  const playerStore = usePlayerStore()
  const roundStore = useRoundStore()
  const matchStore = useMatchStore()

  const sitOutCounts = computed<Record<string, number>>(() => {
    const counts: Record<string, number> = {}
    for (const round of Object.values(roundStore.rounds)) {
      for (const pid of round.sittingOutPlayerIds) {
        counts[pid] = (counts[pid] ?? 0) + 1
      }
    }
    return counts
  })

  const stats = computed<PlayerStats[]>(() => {
    return playerStore.all.map((player) => {
      let gamesPlayed = 0
      let wins = 0
      let losses = 0
      let draws = 0
      let pointsFor = 0
      let pointsAgainst = 0

      for (const round of Object.values(roundStore.rounds)) {
        for (const matchId of round.matchIds) {
          const match = matchStore.byId(matchId)
          if (!match || match.finishedAt === null) continue

          const teamA = roundStore.teamById(match.teamAId)
          const teamB = roundStore.teamById(match.teamBId)
          if (!teamA || !teamB) continue

          const inTeamA = teamA.playerIds.includes(player.id)
          const inTeamB = teamB.playerIds.includes(player.id)
          if (!inTeamA && !inTeamB) continue

          const sA = match.scoreA ?? 0
          const sB = match.scoreB ?? 0
          gamesPlayed++

          if (inTeamA) {
            pointsFor += sA
            pointsAgainst += sB
            if (sA > sB) wins++
            else if (sB > sA) losses++
            else draws++
          } else {
            pointsFor += sB
            pointsAgainst += sA
            if (sB > sA) wins++
            else if (sA > sB) losses++
            else draws++
          }
        }
      }

      return {
        playerId: player.id,
        name: player.name,
        gamesPlayed,
        wins,
        losses,
        draws,
        pointsFor,
        pointsAgainst,
        pointDiff: pointsFor - pointsAgainst,
        winRatio: gamesPlayed > 0 ? wins / gamesPlayed : 0,
        sitOuts: sitOutCounts.value[player.id] ?? 0,
        joinedAfterRound: player.joinedAfterRound,
        active: player.active,
      }
    })
  })

  const sorted = computed(() =>
    [...stats.value].sort((a, b) => {
      if (b.winRatio !== a.winRatio) return b.winRatio - a.winRatio
      if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
      return b.pointsFor - a.pointsFor
    }),
  )

  return { stats, sorted, sitOutCounts }
}
