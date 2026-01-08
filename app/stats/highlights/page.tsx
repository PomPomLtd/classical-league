'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlayerName } from '@/components/stats/player-name'

// Types for the highlights data
interface PlayerCard {
  gamesPlayed: number
  gamesAsWhite: number
  gamesAsBlack: number
  wins: number
  losses: number
  draws: number
  winRate: number
  totalMoves: number
  avgGameLength: number
  accuracy: {
    overall: number
    asWhite: number
    asBlack: number
  }
  moveQuality: {
    excellent: number
    good: number
    inaccuracies: number
    mistakes: number
    blunders: number
  }
  avgCentipawnLoss: number
  favoriteOpening: {
    white: { name: string; eco: string; count: number } | null
    black: { name: string; eco: string; count: number } | null
  }
  tactics: {
    totalCaptures: number
    checksGiven: number
    checkmates: number
  }
}

interface Highlight {
  type: string
  move: string
  description: string
  round: string
  opponent: string
  gameUrl: string
}

interface Player {
  name: string
  card: PlayerCard
  highlights: Highlight[]
}

interface HighlightsData {
  generated: string
  season: number
  status: string
  playerCount: number
  totalGames: number
  players: Player[]
}

// Convert player name to URL-safe slug
function slugifyPlayer(name: string): string {
  return name
    .toLowerCase()
    .replace(/[«»]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Get highlight type emoji
function getHighlightEmoji(type: string): string {
  const emojis: Record<string, string> = {
    checkmate: '♔',
    brilliant_sacrifice: '✨',
    brilliant_move: '💡',
    blunder: '💥',
    comeback: '🔄',
    tactical_check: '⚔️',
    en_passant: '🎯',
    underpromotion: '♟️'
  }
  return emojis[type] || '📍'
}

export default function HighlightsPage() {
  const [data, setData] = useState<HighlightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchHighlights()
  }, [])

  const fetchHighlights = async () => {
    try {
      // Try production file first, fall back to dummy
      let response = await fetch('/stats/season-2-highlights.json', { cache: 'no-store' })
      if (!response.ok) {
        response = await fetch('/stats/season-2-highlights-dummy.json', { cache: 'no-store' })
      }
      if (!response.ok) {
        throw new Error('Failed to load highlights data')
      }
      const jsonData = await response.json()
      setData(jsonData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Filter players by search query
  const filteredPlayers = data?.players.filter(player => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return player.name.toLowerCase().includes(query)
  }) || []

  // Sort by accuracy (highest first)
  const sortedPlayers = [...filteredPlayers].sort(
    (a, b) => b.card.accuracy.overall - a.card.accuracy.overall
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-gray-500 dark:text-gray-400">Loading player highlights...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-red-600 dark:text-red-400 mb-2">Error loading highlights</div>
          <p className="text-sm text-red-500 dark:text-red-500">{error}</p>
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
            Player Highlights
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Stats, highlights, and memorable moments from Season 2
          </p>
        </div>

        {/* Stats Banner */}
        {data && (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-xl p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{data.playerCount}</div>
                <div className="text-emerald-100 mt-2">Players</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{data.totalGames}</div>
                <div className="text-emerald-100 mt-2">Games</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {data.players.reduce((sum, p) => sum + p.highlights.length, 0)}
                </div>
                <div className="text-emerald-100 mt-2">Highlights</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {Math.round(data.players.reduce((sum, p) => sum + p.card.accuracy.overall, 0) / data.players.length)}%
                </div>
                <div className="text-emerald-100 mt-2">Avg Accuracy</div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search players by name or nickname..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Player Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {searchQuery ? `${sortedPlayers.length} players found` : `All ${sortedPlayers.length} Players`}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Sorted by accuracy
            </span>
          </div>

          {sortedPlayers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400">
                No players found matching &quot;{searchQuery}&quot;
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPlayers.map((player, index) => (
                <Link
                  key={player.name}
                  href={`/stats/highlights/${slugifyPlayer(player.name)}`}
                  className="group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-emerald-500 dark:hover:border-emerald-400 transition-all h-full">
                    {/* Player Name */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <span className="text-lg">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          <PlayerName name={player.name} />
                        </h3>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {player.card.accuracy.overall.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {player.card.gamesPlayed}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Games</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {player.card.winRate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Win Rate</div>
                      </div>
                    </div>

                    {/* Record */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="text-green-600 dark:text-green-400">{player.card.wins}W</span>
                      <span>-</span>
                      <span className="text-red-600 dark:text-red-400">{player.card.losses}L</span>
                      <span>-</span>
                      <span className="text-gray-500">{player.card.draws}D</span>
                    </div>

                    {/* Highlights Preview */}
                    {player.highlights.length > 0 && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {player.highlights.length} highlight{player.highlights.length > 1 ? 's' : ''}
                        </div>
                        <div className="flex gap-2">
                          {player.highlights.slice(0, 3).map((h, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              title={h.type}
                            >
                              {getHighlightEmoji(h.type)} {h.type.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Back to Stats */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/stats"
            className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tournament Statistics
          </Link>
        </div>
      </div>
    </div>
  )
}
