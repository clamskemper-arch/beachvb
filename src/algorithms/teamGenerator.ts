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

function formBalancedTeams(
  playing: string[],
  teamSize: number,
  genders: Record<string, 'M' | 'W' | null>,
): string[][] {
  const matchCount = playing.length / (teamSize * 2)
  const women = shuffle(playing.filter((id) => genders[id] === 'W'))
  const others = shuffle(playing.filter((id) => genders[id] !== 'W'))

  const teams: string[][] = Array.from({ length: matchCount * 2 }, () => [])

  // Distribute women evenly across matches, split 50/50 within each match
  let wi = 0
  for (let m = 0; m < matchCount; m++) {
    const womenLeft = women.length - wi
    const matchesLeft = matchCount - m
    const wThisMatch = Math.round(womenLeft / matchesLeft)
    const wA = Math.ceil(wThisMatch / 2)
    const wB = Math.floor(wThisMatch / 2)
    for (let j = 0; j < wA && wi < women.length; j++) teams[m * 2].push(women[wi++])
    for (let j = 0; j < wB && wi < women.length; j++) teams[m * 2 + 1].push(women[wi++])
  }

  // Fill remaining slots with others (men / unspecified)
  let oi = 0
  for (let m = 0; m < matchCount; m++) {
    while (teams[m * 2].length < teamSize) teams[m * 2].push(others[oi++])
    while (teams[m * 2 + 1].length < teamSize) teams[m * 2 + 1].push(others[oi++])
  }

  return teams
}

export function generateRound(
  activePlayers: string[],
  teamSize: number,
  sitOutCounts: Record<string, number>,
  lastSittingOut: string[] = [],
  genders: Record<string, 'M' | 'W' | null> = {},
  courtCount = Infinity,
): GeneratedRound {
  const matchSize = teamSize * 2
  const maxPlaying = Math.floor(Math.min(activePlayers.length, courtCount * matchSize) / matchSize) * matchSize
  const sitOutCount = activePlayers.length - maxPlaying

  let sittingOut: string[] = []
  let playing = [...activePlayers]

  if (sitOutCount > 0) {
    const lastSittingOutSet = new Set(lastSittingOut)
    const sorted = [...activePlayers].sort((a, b) => {
      const aLastOut = lastSittingOutSet.has(a) ? 1 : 0
      const bLastOut = lastSittingOutSet.has(b) ? 1 : 0
      if (aLastOut !== bLastOut) return aLastOut - bLastOut
      const diff = (sitOutCounts[a] ?? 0) - (sitOutCounts[b] ?? 0)
      return diff !== 0 ? diff : Math.random() - 0.5
    })
    sittingOut = sorted.slice(0, sitOutCount)
    const sittingOutSet = new Set(sittingOut)
    playing = activePlayers.filter((id) => !sittingOutSet.has(id))
  }

  // Use gender-balanced assignment; teams are already paired (m*2 vs m*2+1)
  const teams = formBalancedTeams(playing, teamSize, genders)

  return { teams, sittingOut }
}
