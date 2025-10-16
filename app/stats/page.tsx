'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RoundStats {
  roundNumber: number
  totalGames: number
  totalMoves: number
  whiteWins: number
  blackWins: number
  draws: number
  isComplete: boolean
  generatedAt: string
}

export default function StatsPage() {
  const [availableRounds, setAvailableRounds] = useState<RoundStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailableRounds()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const fetchAvailableRounds = async () => {
    try {
      // For now, we'll check which rounds have stats files
      // In the future, this could be an API endpoint
      const rounds: RoundStats[] = []
      const EXPECTED_GAMES_PER_ROUND = 30 // Based on ~50 players in Swiss system

      // Try to fetch stats for rounds 1-7 (Season 2 has 7 rounds)
      // We check sequentially and stop at the first missing round to avoid 404s
      for (let roundNum = 1; roundNum <= 7; roundNum++) {
        try {
          const response = await fetch(`/stats/season-2-round-${roundNum}.json`, {
            cache: 'no-store'
          })
          if (response.ok) {
            const data = await response.json()
            const isComplete = data.overview.totalGames >= EXPECTED_GAMES_PER_ROUND * 0.8 // 80% threshold
            rounds.push({
              roundNumber: data.roundNumber,
              totalGames: data.overview.totalGames,
              totalMoves: data.overview.totalMoves,
              whiteWins: data.results.whiteWins,
              blackWins: data.results.blackWins,
              draws: data.results.draws,
              isComplete,
              generatedAt: data.generatedAt
            })
          } else {
            // Stop checking if we hit a missing round
            break
          }
        } catch {
          // Stop on first error to avoid unnecessary 404s
          break
        }
      }

      setAvailableRounds(rounds)
    } catch (error) {
      console.error('Error fetching rounds:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-gray-500 dark:text-gray-400">Loading statistics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            📊 Tournament Statistics
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Deep dive into the games, tactics, and patterns from Season 2
          </p>
        </div>

        {/* Overall Season Stats */}
        {availableRounds.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-6">Season 2 Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {availableRounds.reduce((sum, r) => sum + r.totalGames, 0)}
                </div>
                <div className="text-indigo-100 mt-2">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {availableRounds.reduce((sum, r) => sum + r.totalMoves, 0).toLocaleString()}
                </div>
                <div className="text-indigo-100 mt-2">Total Moves</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {availableRounds.reduce((sum, r) => sum + r.whiteWins, 0)}
                </div>
                <div className="text-indigo-100 mt-2">White Wins</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {availableRounds.reduce((sum, r) => sum + r.blackWins, 0)}
                </div>
                <div className="text-indigo-100 mt-2">Black Wins</div>
              </div>
            </div>
          </div>
        )}

        {/* Round Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Round Statistics
          </h2>

          {availableRounds.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 mb-2">
                No statistics available yet
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Stats will appear here after each round is completed
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRounds.map((round) => (
                <Link
                  key={round.roundNumber}
                  href={`/stats/round/${round.roundNumber}`}
                  className="group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Round {round.roundNumber}
                        </h3>
                        {!round.isComplete && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            In Progress
                          </span>
                        )}
                      </div>
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Games</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{round.totalGames}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Moves</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{round.totalMoves.toLocaleString()}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            W: {round.whiteWins} / B: {round.blackWins} / D: {round.draws}
                          </div>
                          <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                            View Details →
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-600">
                          Generated {formatDate(round.generatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mt-12">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                About These Statistics
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>• All statistics are generated from official PGN game records</p>
                <p>• Click on any round to see detailed statistics including tactics, piece activity, and board heatmaps</p>
                <p>• New stats are added after each round is completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
