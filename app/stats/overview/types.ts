/**
 * TypeScript interfaces for Season Overview data
 */

export interface SeasonOverview {
  seasonNumber: number
  generatedAt: string
  roundsIncluded: number[]
  aggregates: Aggregates
  hallOfFame: HallOfFame
  playerStats: Record<string, PlayerStats>
  leaderboards: Leaderboards
  trends: Trends
  awardFrequency: AwardFrequencyData
}

export interface Aggregates {
  totalGames: number
  totalMoves: number
  averageGameLength: number
  totalBlunders: number
  totalMistakes: number
  piecesCaptured: {
    pawns: number
    knights: number
    bishops: number
    rooks: number
    queens: number
    total: number
  }
  totalChecks: number
  totalEnPassant: number
  totalPromotions: number
  totalCastling: number
}

export interface HallOfFame {
  cleanestGame: GameSuperlative | null
  wildestGame: GameSuperlative | null
  biggestBlunder: BlunderSuperlative | null
  mostAccurate: PerformanceSuperlative | null
  worstACPL: PerformanceSuperlative | null
  longestGame: BasicGameSuperlative | null
  shortestGame: BasicGameSuperlative | null
  sportiestQueen: QueenSuperlative | null
  mostRetreats: RetreatsSuperlative | null
  longestCheckSequence: SequenceSuperlative | null
  longestCaptureSpree: SequenceSuperlative | null
  earliestCastling: CastlingSuperlative | null
  mostObscureOpening: OpeningSuperlative | null
  biggestComeback: ComebackSuperlative | null
  luckyEscape: EscapeSuperlative | null
}

export interface GameSuperlative {
  round: number
  combinedACPL: number
  whiteACPL: number
  blackACPL: number
  white: string
  black: string
  gameIndex: number
}

export interface BlunderSuperlative {
  round: number
  moveNumber: number
  player: string
  cpLoss: number
  move: string
  white: string
  black: string
  gameIndex: number
}

export interface PerformanceSuperlative {
  round: number
  player: string
  accuracy?: number
  acpl: number
  white: string
  black: string
  gameIndex: number
}

export interface BasicGameSuperlative {
  round: number
  moves: number
  white: string
  black: string
  result: string
}

export interface QueenSuperlative {
  round: number
  distance: number
  distanceCm: number
  distanceHumanScaleM: number
  color: string
  white: string
  black: string
  gameIndex: number
}

export interface RetreatsSuperlative {
  round: number
  retreats: number
  color: string
  white: string
  black: string
  gameIndex: number
}

export interface SequenceSuperlative {
  round: number
  length: number
  startMove: number
  white: string
  black: string
  gameIndex: number
}

export interface CastlingSuperlative {
  round: number
  moves: number
  winner: string
  white: string
  black: string
  gameIndex: number
}

export interface OpeningSuperlative {
  round: number
  eco: string
  name: string
  moves: string
  white: string
  black: string
  gameIndex: number
}

export interface ComebackSuperlative {
  round: number
  player: string
  swing: number
  evalFrom: number
  evalTo: number
  moveNumber: number
  white: string
  black: string
  gameIndex: number
}

export interface EscapeSuperlative {
  round: number
  player: string
  escapeAmount: number
  evalBefore: number
  evalAfter: number
  moveNumber: number
  white: string
  black: string
  gameIndex: number
}

export interface PlayerStats {
  normalizedName: string
  displayName: string
  gamesPlayed: number
  gamesAsWhite: number
  gamesAsBlack: number
  wins: number
  losses: number
  draws: number
  winRate: number
  awards: PlayerAward[]
  awardCount: number
  averageACPL: number | null
  bestACPL: number | null
  worstACPL: number | null
  acplByRound: (number | null)[]
  accuracyByRound: (number | null)[]
  acplVariance: number | null
  openingsUsed: string[]
  openingDiversity: number
  favoriteOpening: string | null
  totalBlunders: number
  totalMistakes: number
}

export interface PlayerAward {
  round: number
  award: string
  details: string
}

export interface Leaderboards {
  mostAwards: LeaderboardEntry[]
  bestAverageACPL: ACPLLeaderboardEntry[]
  worstAverageACPL: ACPLLeaderboardEntry[]
  mostImproved: ImprovementLeaderboardEntry[]
  mostGames: GamesLeaderboardEntry[]
  mostVersatile: VersatileLeaderboardEntry[]
  mostConsistent: ConsistentLeaderboardEntry[]
  highestWinRate: WinRateLeaderboardEntry[]
  mostBlunders: BlunderLeaderboardEntry[]
  fewestBlunders: BlunderLeaderboardEntry[]
}

export interface LeaderboardEntry {
  player: string
  displayName: string
  count: number
  awards: PlayerAward[]
}

export interface ACPLLeaderboardEntry {
  player: string
  displayName: string
  acpl: number
  gamesPlayed: number
}

export interface ImprovementLeaderboardEntry {
  player: string
  displayName: string
  earlyACPL: number
  lateACPL: number
  improvement: number
}

export interface GamesLeaderboardEntry {
  player: string
  displayName: string
  games: number
}

export interface VersatileLeaderboardEntry {
  player: string
  displayName: string
  openingsUsed: number
  openings: string[]
}

export interface ConsistentLeaderboardEntry {
  player: string
  displayName: string
  averageACPL: number
  variance: number
  gamesPlayed: number
}

export interface WinRateLeaderboardEntry {
  player: string
  displayName: string
  winRate: number
  wins: number
  gamesPlayed: number
}

export interface BlunderLeaderboardEntry {
  player: string
  displayName: string
  blunders: number
  blundersPerGame: number
}

export interface Trends {
  averageACPLByRound: (number | null)[]
  averageAccuracyByRound: (number | null)[]
  averageGameLengthByRound: (number | null)[]
  e4PercentageByRound: (number | null)[]
  d4PercentageByRound: (number | null)[]
  drawRateByRound: (number | null)[]
  whiteWinRateByRound: (number | null)[]
  blackWinRateByRound: (number | null)[]
  blundersPerGameByRound: (number | null)[]
  mistakesPerGameByRound: (number | null)[]
  avgQueenDistanceByRound: (number | null)[]
}

export interface AwardFrequencyData {
  frequency: Record<string, AwardFrequency>
  mostCommon: AwardFrequencyEntry | null
  leastCommon: AwardFrequencyEntry | null
  sortedByFrequency: AwardFrequencyEntry[]
}

export interface AwardFrequency {
  displayName: string
  appearances: number
  percentage: number
}

export interface AwardFrequencyEntry {
  key: string
  displayName: string
  appearances: number
  percentage: number
}
