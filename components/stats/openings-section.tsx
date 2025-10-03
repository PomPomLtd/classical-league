import { StatCard } from './stat-card'
import { OpeningPopularityChart } from './opening-popularity-chart'

interface OpeningsSectionProps {
  openings: {
    firstMoves: Record<string, {
      count: number
      percentage: number
      winRate: number
    }>
    popularSequences: Array<{
      moves: string
      count: number
    }>
  }
}

export function OpeningsSection({ openings }: OpeningsSectionProps) {
  return (
    <StatCard title="♟️ Opening Moves">
      <div className="space-y-6">
        {/* Chart Visualization */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Popularity & Win Rates</h4>
          <OpeningPopularityChart openings={openings} />
        </div>

        {/* Detailed Stats */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Details</h4>
          <div className="space-y-3">
            {Object.entries(openings.firstMoves)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([move, data]) => (
                <div key={move} className="flex justify-between items-center">
                  <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{move}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{data.count} games</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {data.percentage.toFixed(0)}% • {data.winRate.toFixed(0)}% win rate
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </StatCard>
  )
}
