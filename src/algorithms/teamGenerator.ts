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
): GeneratedRound {
  const matchSize = teamSize * 2
  const remainder = activePlayers.length % matchSize

  let sittingOut: string[] = []
  let playing = [...activePlayers]

  if (remainder > 0) {
    const sorted = [...activePlayers].sort((a, b) => {
      const diff = (sitOutCounts[b] ?? 0) - (sitOutCounts[a] ?? 0)
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
