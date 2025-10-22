import { StatCard } from './stat-card'
import { PlayerVs } from './player-name'

interface NotableGamesProps {
  overview: {
    longestGame: {
      moves: number
      white: string
      black: string
      result: string
    }
    shortestGame: {
      moves: number
      white: string
      black: string
      result: string
    }
  }
  longestNonCaptureStreak: {
    moves: number
    white: string
    black: string
  }
}

export function NotableGames({ overview, longestNonCaptureStreak }: NotableGamesProps) {
  return (
    <StatCard title="🎯 Notable Games">
      <div className="space-y-4">
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">Longest Game</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <PlayerVs white={overview.longestGame.white} black={overview.longestGame.black} />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {overview.longestGame.moves} moves • Result: {overview.longestGame.result}
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Shortest Game</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <PlayerVs white={overview.shortestGame.white} black={overview.shortestGame.black} />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {overview.shortestGame.moves} moves • Result: {overview.shortestGame.result}
          </div>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="font-semibold text-green-900 dark:text-green-300 mb-1">Longest Non-Capture Streak</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <PlayerVs white={longestNonCaptureStreak.white} black={longestNonCaptureStreak.black} />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {longestNonCaptureStreak.moves} consecutive moves without captures
          </div>
        </div>
      </div>
    </StatCard>
  )
}
