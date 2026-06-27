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
}

export interface Team {
  id: TeamID
  roundId: RoundID
  playerIds: PlayerID[]
}

export interface Match {
  id: MatchID
  roundId: RoundID
  teamAId: TeamID
  teamBId: TeamID
  scoreA: number | null
  scoreB: number | null
  finishedAt: number | null
}

export type RoundStatus = 'active' | 'finished'

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
  pointsFor: number
  pointsAgainst: number
  pointDiff: number
  winRatio: number
  sitOuts: number
  joinedAfterRound: number | null
  active: boolean
}
