import { StatCard } from './stat-card'
import { PlayerVs } from './player-name'

interface CheckmatesSectionProps {
  checkmates: {
    byPiece: Record<string, number>
    fastest: {
      moves: number
      gameIndex: number
      white: string
      black: string
      winner: string
    } | null
  }
}

export function CheckmatesSection({ checkmates }: CheckmatesSectionProps) {
  return (
    <StatCard title="☠️ Checkmates">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">By Piece</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(checkmates.byPiece)
              .filter(([piece]) => piece !== 'king')
              .map(([piece, count]) => (
              <div key={piece} className="text-center p-2 bg-gray-50 dark:bg-gray-900/20 rounded">
                <div className="font-bold text-gray-900 dark:text-white">{count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{piece}</div>
              </div>
            ))}
          </div>
        </div>

        {checkmates.fastest && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="font-semibold text-red-900 dark:text-red-300 mb-1">⚡ Fastest Checkmate</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={checkmates.fastest.white} black={checkmates.fastest.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {checkmates.fastest.moves} moves • Winner: {checkmates.fastest.winner}
            </div>
          </div>
        )}
      </div>
    </StatCard>
  )
}
