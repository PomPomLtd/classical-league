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
    totalUnderpromotions: number
  }
}

export function TacticsSection({ tactics }: TacticsSectionProps) {
  // Calculate total en passant moves across all games
  const totalEnPassant = tactics.enPassantGames.reduce((sum, game) => sum + game.count, 0)

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
        {tactics.totalUnderpromotions > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Underpromotions</span>
            <span className="font-semibold text-gray-900 dark:text-white">{tactics.totalUnderpromotions}</span>
          </div>
        )}
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
          <span className="font-semibold text-gray-900 dark:text-white">{totalEnPassant}</span>
        </div>
      </div>
    </StatCard>
  )
}
