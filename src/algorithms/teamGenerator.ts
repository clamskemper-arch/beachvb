export interface GeneratedRound {
  teams: string[][]
  sittingOut: string[]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateRound(
  activePlayers: string[],
  teamSize: number,
  sitOutCounts: Record<string, number>,
  lastSittingOut: string[] = [],
): GeneratedRound {
  const matchSize = teamSize * 2
  const remainder = activePlayers.length % matchSize

  let sittingOut: string[] = []
  let playing = [...activePlayers]

  if (remainder > 0) {
    const lastSittingOutSet = new Set(lastSittingOut)

    const sorted = [...activePlayers].sort((a, b) => {
      // Players who sat out last round are strongly deprioritized (play first)
      const aLastOut = lastSittingOutSet.has(a) ? 1 : 0
      const bLastOut = lastSittingOutSet.has(b) ? 1 : 0
      if (aLastOut !== bLastOut) return aLastOut - bLastOut

      // Among the rest: fewest sit-outs → sit out next (ascending)
      const diff = (sitOutCounts[a] ?? 0) - (sitOutCounts[b] ?? 0)
      return diff !== 0 ? diff : Math.random() - 0.5
    })

    sittingOut = sorted.slice(0, remainder)
    const sittingOutSet = new Set(sittingOut)
    playing = activePlayers.filter((id) => !sittingOutSet.has(id))
  }

  const shuffled = shuffle(playing)

  const teams: string[][] = []
  for (let i = 0; i < shuffled.length; i += teamSize) {
    teams.push(shuffled.slice(i, i + teamSize))
  }

  return { teams, sittingOut }
}
