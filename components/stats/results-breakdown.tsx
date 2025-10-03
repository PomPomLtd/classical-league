import { StatCard } from './stat-card'
import { WinRateChart } from './win-rate-chart'

interface ResultsBreakdownProps {
  results: {
    whiteWins: number
    blackWins: number
    draws: number
    whiteWinPercentage: number
    blackWinPercentage: number
    drawPercentage: number
  }
}

export function ResultsBreakdown({ results }: ResultsBreakdownProps) {
  return (
    <StatCard title="📊 Results Breakdown">
      {/* Pie Chart */}
      <div className="mb-6">
        <WinRateChart results={results} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{results.whiteWins}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">White Wins</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{results.blackWins}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Black Wins</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{results.draws}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Draws</div>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">White Win Rate</span>
            <span className="font-semibold text-gray-900 dark:text-white">{results.whiteWinPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-white h-2 rounded-full" style={{ width: `${results.whiteWinPercentage}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Black Win Rate</span>
            <span className="font-semibold text-gray-900 dark:text-white">{results.blackWinPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-gray-800 dark:bg-gray-400 h-2 rounded-full" style={{ width: `${results.blackWinPercentage}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Draw Rate</span>
            <span className="font-semibold text-gray-900 dark:text-white">{results.drawPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-gray-400 dark:bg-gray-500 h-2 rounded-full" style={{ width: `${results.drawPercentage}%` }}></div>
          </div>
        </div>
      </div>
    </StatCard>
  )
}
