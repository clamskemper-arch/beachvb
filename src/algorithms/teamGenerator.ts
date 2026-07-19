export interface GeneratedRound {
  teams: string[][]
  sittingOut: string[]
}

// How often two players have been teammates/opponents so far. Symmetric:
// counts[a][b] === counts[b][a].
export type PairingCounts = Record<string, Record<string, number>>

export interface PairingHistory {
  teammate: PairingCounts
  opponent: PairingCounts
}

export function createPairingHistory(): PairingHistory {
  return { teammate: {}, opponent: {} }
}

function bump(counts: PairingCounts, a: string, b: string) {
  counts[a] ??= {}
  counts[a][b] = (counts[a][b] ?? 0) + 1
  counts[b] ??= {}
  counts[b][a] = (counts[b][a] ?? 0) + 1
}

// Records that teamA played against teamB (and thus who was whose teammate/opponent).
export function recordMatchup(history: PairingHistory, teamA: string[], teamB: string[]) {
  for (let i = 0; i < teamA.length; i++) {
    for (let j = i + 1; j < teamA.length; j++) bump(history.teammate, teamA[i], teamA[j])
  }
  for (let i = 0; i < teamB.length; i++) {
    for (let j = i + 1; j < teamB.length; j++) bump(history.teammate, teamB[i], teamB[j])
  }
  for (const a of teamA) {
    for (const b of teamB) bump(history.opponent, a, b)
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Greedily fills the given team slots with candidates, each time picking
// whichever remaining candidate has played least often with that team's
// current members / against that team's current opponents.
function fillSlots(teams: string[][], slotTeamIndices: number[], candidates: string[], history: PairingHistory) {
  const remaining = shuffle(candidates)
  const slots = shuffle(slotTeamIndices)

  for (const teamIdx of slots) {
    const oppIdx = teamIdx % 2 === 0 ? teamIdx + 1 : teamIdx - 1
    const team = teams[teamIdx]
    const opp = teams[oppIdx]

    let bestPos = 0
    let bestCost = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i]
      let cost = 0
      for (const mate of team) cost += history.teammate[candidate]?.[mate] ?? 0
      for (const rival of opp) cost += history.opponent[candidate]?.[rival] ?? 0
      if (cost < bestCost) {
        bestCost = cost
        bestPos = i
      }
    }
    team.push(remaining[bestPos])
    remaining.splice(bestPos, 1)
  }
}

function formBalancedTeams(
  playing: string[],
  teamSize: number,
  genders: Record<string, 'M' | 'W' | null>,
  history: PairingHistory,
): string[][] {
  const matchCount = playing.length / (teamSize * 2)
  const women = playing.filter((id) => genders[id] === 'W')
  const others = playing.filter((id) => genders[id] !== 'W')

  const teams: string[][] = Array.from({ length: matchCount * 2 }, () => [])

  // Determine how many women each team should get, split evenly across matches and 50/50 within each match
  const womenTargets: number[] = new Array(matchCount * 2).fill(0)
  let wi = 0
  for (let m = 0; m < matchCount; m++) {
    const womenLeft = women.length - wi
    const matchesLeft = matchCount - m
    const wThisMatch = Math.round(womenLeft / matchesLeft)
    const wA = Math.ceil(wThisMatch / 2)
    const wB = Math.floor(wThisMatch / 2)
    let a = 0
    for (; a < wA && wi < women.length; a++) wi++
    womenTargets[m * 2] = a
    let b = 0
    for (; b < wB && wi < women.length; b++) wi++
    womenTargets[m * 2 + 1] = b
  }
  const womenSlots = womenTargets.flatMap((count, teamIdx) => Array(count).fill(teamIdx))
  fillSlots(teams, womenSlots, women, history)

  // Fill remaining slots with others (men / unspecified)
  const otherSlots = teams.flatMap((team, teamIdx) => Array(teamSize - team.length).fill(teamIdx))
  fillSlots(teams, otherSlots, others, history)

  return teams
}

export function generateRound(
  activePlayers: string[],
  teamSize: number,
  sitOutCounts: Record<string, number>,
  lastSittingOut: string[] = [],
  genders: Record<string, 'M' | 'W' | null> = {},
  courtCount = Infinity,
  history: PairingHistory = createPairingHistory(),
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

  // Use gender-balanced assignment, minimizing repeat teammates/opponents; teams are already paired (m*2 vs m*2+1)
  const teams = formBalancedTeams(playing, teamSize, genders, history)

  return { teams, sittingOut }
}
