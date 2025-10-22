import { StatCard } from './stat-card'
import { PlayerVs } from './player-name'

interface TacticalPatternsSectionProps {
  tacticalPatterns: {
    games: Array<{
      gameIndex: number
      white: string
      black: string
      pins: {
        total: number
        whitePinned: number
        blackPinned: number
      }
      forks: {
        total: number
        knightForks: number
        royalForks: number
        whiteForks: number
        blackForks: number
        buffetForks: number
      }
      skewers: {
        total: number
        whiteSkewers: number
        blackSkewers: number
      }
    }>
    summary: {
      totalGames: number
      totalPins: number
      totalForks: number
      totalSkewers: number
      totalKnightForks: number
      totalRoyalForks: number
      totalBuffetForks: number
      mostPinsGame: {
        white: string
        black: string
        pins: {
          total: number
        }
      } | null
      mostForksGame: {
        white: string
        black: string
        forks: {
          total: number
        }
      } | null
      mostSkewersGame: {
        white: string
        black: string
        skewers: {
          total: number
        }
      } | null
    }
  }
}

export function TacticalPatternsSection({ tacticalPatterns }: TacticalPatternsSectionProps) {
  const { summary } = tacticalPatterns

  return (
    <StatCard title="🎯 Tactical Patterns">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {summary.totalPins}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">📌 Total Pins</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Pieces unable to move
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {summary.totalForks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">🍴 Total Forks</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {summary.totalKnightForks} knight • {summary.totalRoyalForks} royal • {summary.totalBuffetForks} buffet
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {summary.totalSkewers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">🍢 Total Skewers</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              X-ray attacks
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Breakdown by Type
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pins Details */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📌</span>
                <h4 className="font-semibold text-gray-900 dark:text-white">Pins</h4>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Average per game: {(summary.totalPins / summary.totalGames).toFixed(1)}</div>
                {summary.mostPinsGame && (
                  <div className="mt-2 text-xs bg-blue-100 dark:bg-blue-900/30 rounded p-2">
                    <div className="font-medium text-blue-900 dark:text-blue-100">Most in one game:</div>
                    <div className="text-blue-800 dark:text-blue-200">
                      <PlayerVs white={summary.mostPinsGame.white} black={summary.mostPinsGame.black} />
                    </div>
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {summary.mostPinsGame.pins.total} pins!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Forks Details */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🍴</span>
                <h4 className="font-semibold text-gray-900 dark:text-white">Forks</h4>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Average per game: {(summary.totalForks / summary.totalGames).toFixed(1)}</div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded p-2 text-center">
                    <div className="font-bold text-purple-600 dark:text-purple-400">
                      {summary.totalKnightForks}
                    </div>
                    <div className="text-purple-800 dark:text-purple-300">♞ Knight</div>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded p-2 text-center">
                    <div className="font-bold text-yellow-600 dark:text-yellow-400">
                      {summary.totalRoyalForks}
                    </div>
                    <div className="text-yellow-800 dark:text-yellow-300">👑 Royal</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 rounded p-2 text-center">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      {summary.totalBuffetForks}
                    </div>
                    <div className="text-green-800 dark:text-green-300">🍽️ Buffet</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skewers Details */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🍢</span>
                <h4 className="font-semibold text-gray-900 dark:text-white">Skewers</h4>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Average per game: {(summary.totalSkewers / summary.totalGames).toFixed(1)}</div>
                {summary.mostSkewersGame && (
                  <div className="mt-2 text-xs bg-orange-100 dark:bg-orange-900/30 rounded p-2">
                    <div className="font-medium text-orange-900 dark:text-orange-100">Most in one game:</div>
                    <div className="text-orange-800 dark:text-orange-200">
                      <PlayerVs white={summary.mostSkewersGame.white} black={summary.mostSkewersGame.black} />
                    </div>
                    <div className="font-bold text-orange-600 dark:text-orange-400">
                      {summary.mostSkewersGame.skewers.total} skewers!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💡</span>
                <h4 className="font-semibold text-gray-900 dark:text-white">Legend</h4>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                <div><strong>Knight Fork:</strong> Fork by a knight</div>
                <div><strong>Royal Fork:</strong> Fork involving the king</div>
                <div><strong>Buffet Fork:</strong> Attacking 3+ pieces</div>
                <div><strong>Skewer:</strong> X-ray attack on aligned pieces</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StatCard>
  )
}
