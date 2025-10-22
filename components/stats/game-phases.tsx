import { StatCard } from './stat-card'
import { PlayerName } from './player-name'

interface GamePhasesProps {
  gamePhases: {
    averageOpening: number
    averageMiddlegame: number
    averageEndgame: number
    longestWaitTillCapture: {
      moves: number
      white: string
      black: string
      game: string
    }
    longestMiddlegame: {
      moves: number
      white: string
      black: string
      game: string
    }
    longestEndgame: {
      moves: number
      white: string
      black: string
      game: string
    }
  }
}

export function GamePhases({ gamePhases }: GamePhasesProps) {
  return (
    <StatCard title="⏱️ Game Phases">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(gamePhases.averageOpening)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Opening</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(gamePhases.averageMiddlegame)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Middlegame</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(gamePhases.averageEndgame)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Endgame</div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Longest Wait Till First Capture: {gamePhases.longestWaitTillCapture.moves} moves</div>
          <div className="text-sm text-gray-700 dark:text-gray-300"><PlayerName name={gamePhases.longestWaitTillCapture.game} /></div>
        </div>
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">Longest Middlegame: {gamePhases.longestMiddlegame.moves} moves</div>
          <div className="text-sm text-gray-700 dark:text-gray-300"><PlayerName name={gamePhases.longestMiddlegame.game} /></div>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="font-semibold text-green-900 dark:text-green-300 mb-1">Longest Endgame: {gamePhases.longestEndgame.moves} moves</div>
          <div className="text-sm text-gray-700 dark:text-gray-300"><PlayerName name={gamePhases.longestEndgame.game} /></div>
        </div>
      </div>
    </StatCard>
  )
}
