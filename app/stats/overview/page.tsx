'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SeasonOverview } from './types'
import { OverviewHero } from '@/components/stats/overview/overview-hero'
import { PieceCemetery } from '@/components/stats/overview/piece-cemetery'
import { HallOfFameSection } from '@/components/stats/overview/hall-of-fame-section'
import { TrendsSection } from '@/components/stats/overview/trends-section'
import { LeaderboardsSection } from '@/components/stats/overview/leaderboards-section'

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

export default function OverviewPage() {
  const [overview, setOverview] = useState<SeasonOverview | null>(null)
  const [availableRounds, setAvailableRounds] = useState<RoundStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOverview()
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

  const fetchOverview = async () => {
    try {
      const response = await fetch('/stats/season-2-overview.json', {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error('Overview not found')
      }

      const data = await response.json()
      setOverview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load overview')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableRounds = async () => {
    try {
      const rounds: RoundStats[] = []
      const EXPECTED_GAMES_PER_ROUND = 30

      for (let roundNum = 1; roundNum <= 7; roundNum++) {
        try {
          const response = await fetch(`/stats/season-2-round-${roundNum}.json`, {
            cache: 'no-store'
          })
          if (response.ok) {
            const data = await response.json()
            const isComplete = data.overview.totalGames >= EXPECTED_GAMES_PER_ROUND * 0.8
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
            break
          }
        } catch {
          break
        }
      }

      setAvailableRounds(rounds)
    } catch (error) {
      console.error('Error fetching rounds:', error)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-gray-500 dark:text-gray-400">Loading season overview...</div>
        </div>
      </div>
    )
  }

  if (error || !overview) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Overview Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Season overview has not been generated yet'}
          </p>
          <Link
            href="/stats"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← Back to Stats
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-8">

        {/* Header */}
        <div>
          <Link
            href="/stats"
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mb-4 inline-block"
          >
            ← Back to Stats
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            🏆 Season {overview.seasonNumber} Overview
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Complete tournament statistics across all rounds
          </p>
        </div>

        {/* Hero Section */}
        <OverviewHero
          aggregates={overview.aggregates}
          roundsIncluded={overview.roundsIncluded}
          seasonNumber={overview.seasonNumber}
        />

        {/* Piece Cemetery */}
        <PieceCemetery aggregates={overview.aggregates} />

        {/* Hall of Fame */}
        <HallOfFameSection hallOfFame={overview.hallOfFame} />

        {/* Leaderboards */}
        <LeaderboardsSection leaderboards={overview.leaderboards} />

        {/* Trends */}
        <TrendsSection
          trends={overview.trends}
          roundsIncluded={overview.roundsIncluded}
        />

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

        {/* Footer Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-semibold text-gray-900 dark:text-white mb-2">
              📊 Overview Statistics
            </p>
            <ul className="space-y-1">
              <li>• Generated: {new Date(overview.generatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</li>
              <li>• Rounds analyzed: {overview.roundsIncluded.join(', ')}</li>
              <li>• Players tracked: {Object.keys(overview.playerStats).length}</li>
              <li>• Hall of Fame entries: {Object.values(overview.hallOfFame).filter(v => v !== null).length}</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
