export type PlayerID = string
export type TeamID = string
export type RoundID = string
export type MatchID = string

export interface Player {
  id: PlayerID
  name: string
  createdAt: number
  active: boolean
  joinedAfterRound: number | null
  gender: 'M' | 'W' | null
}

export interface Team {
  id: TeamID
  roundId: RoundID
  playerIds: PlayerID[]
}

export interface SetResult {
  scoreA: number
  scoreB: number
}

export interface Match {
  id: MatchID
  roundId: RoundID
  teamAId: TeamID
  teamBId: TeamID
  sets: SetResult[]
  scoreA: number | null  // sets won by team A
  scoreB: number | null  // sets won by team B
  finishedAt: number | null
}

export type RoundStatus = 'pending' | 'active' | 'finished'

export interface Round {
  id: RoundID
  number: number
  status: RoundStatus
  matchIds: MatchID[]
  sittingOutPlayerIds: PlayerID[]
  activePlayerSnapshot: PlayerID[]
}

export interface TournamentConfig {
  teamSize: 2 | 3 | 4
  setsPerMatch: number
  minGamesPerPlayer: number
  courtCount: number
}

export type TournamentStatus = 'setup' | 'running' | 'finished'

export interface Tournament {
  id: string
  name: string
  config: TournamentConfig
  playerIds: PlayerID[]
  roundIds: RoundID[]
  status: TournamentStatus
  createdAt: number
}

export interface PlayerStats {
  playerId: PlayerID
  name: string
  gamesPlayed: number
  wins: number
  losses: number
  draws: number
  setsWon: number
  setsPlayed: number
  pointsFor: number
  pointsAgainst: number
  pointDiff: number
  winRatio: number  // setsWon / setsPlayed
  sitOuts: number
  joinedAfterRound: number | null
  active: boolean
}
