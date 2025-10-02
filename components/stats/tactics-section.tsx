import { StatCard } from './stat-card'

interface TacticsSectionProps {
  tactics: {
    totalCaptures: number
    enPassantGames: Array<{
      white: string
      black: string
      count: number
    }>
    promotions: number
    castling: {
      kingside: number
      queenside: number
    }
    bloodiestGame: {
      captures: number
      gameIndex: number
      white: string
      black: string
    }
    quietestGame: {
      captures: number
      gameIndex: number
      white: string
      black: string
    }
    longestNonCaptureStreak: {
      moves: number
      gameIndex: number
      white: string
      black: string
    }
  }
}

export function TacticsSection({ tactics }: TacticsSectionProps) {
  return (
    <StatCard title="⚔️ Tactical Stats">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Total Captures</span>
          <span className="font-semibold text-gray-900 dark:text-white">{tactics.totalCaptures}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Promotions</span>
          <span className="font-semibold text-gray-900 dark:text-white">{tactics.promotions}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Kingside Castling</span>
          <span className="font-semibold text-gray-900 dark:text-white">{tactics.castling.kingside}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Queenside Castling</span>
          <span className="font-semibold text-gray-900 dark:text-white">{tactics.castling.queenside}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">En Passant</span>
          <span className="font-semibold text-gray-900 dark:text-white">{tactics.enPassantGames.length}</span>
        </div>
      </div>
    </StatCard>
  )
}
