'use client'

import { useState } from 'react'
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
      eco: string | null
      name: string | null
    }>
  }
}

export function OpeningsSection({ openings }: OpeningsSectionProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedSequences = showAll ? openings.popularSequences : openings.popularSequences.slice(0, 5)

  // Format move sequence with move numbers (e.g., "e4 c5 Nf3" -> "1.e4 c5 2.Nf3")
  const formatMoves = (moves: string) => {
    const moveArray = moves.split(' ')
    let formatted = ''
    let moveNumber = 1

    for (let i = 0; i < moveArray.length; i++) {
      if (i % 2 === 0) {
        // White's move
        formatted += `${moveNumber}.${moveArray[i]}`
      } else {
        // Black's move
        formatted += ` ${moveArray[i]}`
        moveNumber++
      }

      // Add space between move pairs, but not at the end
      if (i < moveArray.length - 1 && i % 2 === 1) {
        formatted += ' '
      }
    }

    return formatted
  }

  return (
    <StatCard title="♟️ Opening Moves">
      <div className="space-y-6">
        {/* Chart Visualization */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Popularity & Win Rates</h4>
          <OpeningPopularityChart openings={openings} />
        </div>

        {/* First Move Statistics - Compact Grid */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">First Move Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(openings.firstMoves)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([move, data]) => (
                <div key={move} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{move}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{data.count}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {data.percentage.toFixed(0)}% popularity • {data.winRate.toFixed(0)}% win rate
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Popular Opening Sequences */}
        {openings.popularSequences.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Opening Variations</h4>
              {openings.popularSequences.length > 5 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  {showAll ? 'Show Less' : `Show All (${openings.popularSequences.length})`}
                </button>
              )}
            </div>
            <div className="space-y-3">
              {displayedSequences.map((seq, idx) => (
                <div key={idx} className="border-l-2 border-indigo-500 dark:border-indigo-400 pl-3 py-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {seq.name && (
                        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {seq.eco && <span className="text-indigo-600 dark:text-indigo-400 mr-2">{seq.eco}</span>}
                          {seq.name}
                        </div>
                      )}
                      <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        {formatMoves(seq.moves)}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-500">
                      {seq.count} {seq.count === 1 ? 'game' : 'games'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StatCard>
  )
}
