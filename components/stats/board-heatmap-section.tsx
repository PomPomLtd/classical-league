'use client'

import { useState } from 'react'
import { BoardHeatmap } from '../board-heatmap'
import { StatCard } from './stat-card'

interface BoardHeatmapSectionProps {
  boardHeatmap: {
    bloodiestSquare: {
      square: string
      captures: number
      description: string
    }
    mostPopularSquare: {
      square: string
      visits: number
      description: string
    }
    leastPopularSquare: {
      square: string
      visits: number
      description: string
    }
    quietestSquares: string[]
    top5Bloodiest: Array<{
      square: string
      captures: number
    }>
    top5Popular: Array<{
      square: string
      visits: number
    }>
  }
}

export function BoardHeatmapSection({ boardHeatmap }: BoardHeatmapSectionProps) {
  const [heatmapMode, setHeatmapMode] = useState<'popularity' | 'captures'>('popularity')

  return (
    <StatCard title="🗺️ Board Heatmap">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{boardHeatmap.bloodiestSquare.square}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bloodiest Square</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{boardHeatmap.bloodiestSquare.captures} captures</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{boardHeatmap.mostPopularSquare.square}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Most Popular</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{boardHeatmap.mostPopularSquare.visits} visits</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{boardHeatmap.leastPopularSquare.square}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Least Popular</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{boardHeatmap.leastPopularSquare.visits} visits</div>
          </div>
        </div>

        {/* Visual Heatmap Tabs */}
        <div>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mb-4">
            <button
              onClick={() => setHeatmapMode('popularity')}
              className={`px-4 py-2 rounded-md font-medium transition-colors text-sm sm:text-base ${
                heatmapMode === 'popularity'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Most Popular Squares
            </button>
            <button
              onClick={() => setHeatmapMode('captures')}
              className={`px-4 py-2 rounded-md font-medium transition-colors text-sm sm:text-base ${
                heatmapMode === 'captures'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Bloodiest Squares
            </button>
          </div>

          <div className="flex justify-center overflow-x-auto">
            <BoardHeatmap
              top5Popular={boardHeatmap.top5Popular}
              top5Bloodiest={boardHeatmap.top5Bloodiest}
              mode={heatmapMode}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Top 5 Bloodiest Squares</h4>
            <div className="space-y-2">
              {boardHeatmap.top5Bloodiest.map((sq, idx) => (
                <div key={sq.square} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {idx + 1}. {sq.square}
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{sq.captures} captures</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Top 5 Most Popular Squares</h4>
            <div className="space-y-2">
              {boardHeatmap.top5Popular.map((sq, idx) => (
                <div key={sq.square} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {idx + 1}. {sq.square}
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{sq.visits} visits</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {boardHeatmap.quietestSquares.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Never Visited:</span> {boardHeatmap.quietestSquares.join(', ')}
            </div>
          </div>
        )}
      </div>
    </StatCard>
  )
}
