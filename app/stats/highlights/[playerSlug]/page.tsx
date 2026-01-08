'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PlayerName } from '@/components/stats/player-name'
import { StatCard } from '@/components/stats/stat-card'

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
  longestGame?: {
    moves: number
    opponent: string
    round: string
    result: string
  }
  shortestGame?: {
    moves: number
    opponent: string
    round: string
    result: string
  }
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
    castledKingside?: number
    castledQueenside?: number
  }
}

interface Highlight {
  type: string
  priority: number
  score: number
  fen: string
  move: string
  moveUci: string
  bestMove: string
  evalBefore: string
  evalAfter: string
  description: string
  moveNumber: number
  color: string
  opponent: string
  round: string
  result: string
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

// Get highlight type display info
function getHighlightInfo(type: string): { emoji: string; label: string; color: string } {
  const info: Record<string, { emoji: string; label: string; color: string }> = {
    checkmate: { emoji: '♔', label: 'Checkmate', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' },
    brilliant_sacrifice: { emoji: '✨', label: 'Brilliant Sacrifice', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' },
    brilliant_move: { emoji: '💡', label: 'Brilliant Move', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' },
    blunder: { emoji: '💥', label: 'Blunder', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' },
    comeback: { emoji: '🔄', label: 'Comeback', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' },
    tactical_check: { emoji: '⚔️', label: 'Tactical Check', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200' },
    en_passant: { emoji: '🎯', label: 'En Passant', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200' },
    underpromotion: { emoji: '♟️', label: 'Underpromotion', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200' }
  }
  return info[type] || { emoji: '📍', label: type.replace('_', ' '), color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' }
}

// Generate Lichess analysis URL from FEN
// Lichess expects /standard/ prefix and spaces replaced with underscores
function getLichessAnalysisUrl(fen: string): string {
  return `https://lichess.org/analysis/standard/${fen.replace(/ /g, '_')}`
}

export default function PlayerHighlightsPage() {
  const params = useParams()
  const playerSlug = params.playerSlug as string

  const [data, setData] = useState<HighlightsData | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const response = await fetch('/stats/season-2-highlights.json', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load highlights data')
        }
        const jsonData: HighlightsData = await response.json()
        setData(jsonData)

        // Find the player by slug
        const foundPlayer = jsonData.players.find(p => slugifyPlayer(p.name) === playerSlug)
        if (!foundPlayer) {
          setError('Player not found')
        } else {
          setPlayer(foundPlayer)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchHighlights()
  }, [playerSlug])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-gray-500 dark:text-gray-400">Loading player data...</div>
        </div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-red-600 dark:text-red-400 mb-2">Player not found</div>
          <p className="text-sm text-red-500 dark:text-red-500 mb-4">{error || 'Could not find the requested player'}</p>
          <Link
            href="/stats/highlights"
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Back to all players
          </Link>
        </div>
      </div>
    )
  }

  const { card } = player

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-8">
        {/* Back Link */}
        <Link
          href="/stats/highlights"
          className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all players
        </Link>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            <PlayerName name={player.name} />
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Season {data?.season} Player Card
          </p>
        </div>

        {/* Stats Overview Banner */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{card.accuracy.overall.toFixed(1)}%</div>
              <div className="text-emerald-100 mt-2">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{card.gamesPlayed}</div>
              <div className="text-emerald-100 mt-2">Games</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{card.winRate.toFixed(0)}%</div>
              <div className="text-emerald-100 mt-2">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{card.totalMoves}</div>
              <div className="text-emerald-100 mt-2">Total Moves</div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Record */}
          <StatCard title="Record">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Wins</span>
                <span className="text-green-600 dark:text-green-400 font-bold text-xl">{card.wins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Losses</span>
                <span className="text-red-600 dark:text-red-400 font-bold text-xl">{card.losses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Draws</span>
                <span className="text-gray-500 font-bold text-xl">{card.draws}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">As White</span>
                  <span className="text-gray-700 dark:text-gray-300">{card.gamesAsWhite} games</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-500 dark:text-gray-400">As Black</span>
                  <span className="text-gray-700 dark:text-gray-300">{card.gamesAsBlack} games</span>
                </div>
              </div>
            </div>
          </StatCard>

          {/* Accuracy */}
          <StatCard title="Accuracy">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Overall</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xl">{card.accuracy.overall.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">As White</span>
                <span className="text-gray-700 dark:text-gray-300">{card.accuracy.asWhite.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">As Black</span>
                <span className="text-gray-700 dark:text-gray-300">{card.accuracy.asBlack.toFixed(1)}%</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Avg Centipawn Loss</span>
                  <span className="text-gray-700 dark:text-gray-300">{card.avgCentipawnLoss.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </StatCard>

          {/* Move Quality */}
          <StatCard title="Move Quality">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-green-600 dark:text-green-400">Excellent</span>
                <span className="font-semibold">{card.moveQuality.excellent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 dark:text-blue-400">Good</span>
                <span className="font-semibold">{card.moveQuality.good}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-600 dark:text-yellow-400">Inaccuracies</span>
                <span className="font-semibold">{card.moveQuality.inaccuracies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-600 dark:text-orange-400">Mistakes</span>
                <span className="font-semibold">{card.moveQuality.mistakes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600 dark:text-red-400">Blunders</span>
                <span className="font-semibold">{card.moveQuality.blunders}</span>
              </div>
            </div>
          </StatCard>

          {/* Favorite Openings */}
          <StatCard title="Favorite Openings">
            <div className="space-y-4">
              {card.favoriteOpening.white && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">As White</div>
                  <div className="text-gray-900 dark:text-white font-medium">{card.favoriteOpening.white.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {card.favoriteOpening.white.eco} ({card.favoriteOpening.white.count}x)
                  </div>
                </div>
              )}
              {card.favoriteOpening.black && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">As Black</div>
                  <div className="text-gray-900 dark:text-white font-medium">{card.favoriteOpening.black.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {card.favoriteOpening.black.eco} ({card.favoriteOpening.black.count}x)
                  </div>
                </div>
              )}
            </div>
          </StatCard>

          {/* Tactical Stats */}
          <StatCard title="Tactics">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Captures</span>
                <span className="font-bold text-xl">{card.tactics.totalCaptures}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Checks Given</span>
                <span className="font-bold text-xl">{card.tactics.checksGiven}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Checkmates</span>
                <span className="font-bold text-xl">{card.tactics.checkmates}</span>
              </div>
              {(card.tactics.castledKingside !== undefined || card.tactics.castledQueenside !== undefined) && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Castled Kingside</span>
                    <span className="text-gray-700 dark:text-gray-300">{card.tactics.castledKingside || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-500 dark:text-gray-400">Castled Queenside</span>
                    <span className="text-gray-700 dark:text-gray-300">{card.tactics.castledQueenside || 0}</span>
                  </div>
                </div>
              )}
            </div>
          </StatCard>

          {/* Game Length */}
          <StatCard title="Game Length">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Avg Length</span>
                <span className="font-bold text-xl">{card.avgGameLength.toFixed(1)} moves</span>
              </div>
              {card.longestGame && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Longest Game</div>
                  <div className="text-gray-900 dark:text-white font-medium">{card.longestGame.moves} moves</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    vs <PlayerName name={card.longestGame.opponent} className="text-gray-600 dark:text-gray-300" /> (R{card.longestGame.round}, {card.longestGame.result})
                  </div>
                </div>
              )}
              {card.shortestGame && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shortest Game</div>
                  <div className="text-gray-900 dark:text-white font-medium">{card.shortestGame.moves} moves</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    vs <PlayerName name={card.shortestGame.opponent} className="text-gray-600 dark:text-gray-300" /> (R{card.shortestGame.round}, {card.shortestGame.result})
                  </div>
                </div>
              )}
            </div>
          </StatCard>
        </div>

        {/* Highlights Section */}
        {player.highlights.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Highlight Moments ({player.highlights.length})
            </h2>

            <div className="space-y-6">
              {player.highlights.map((highlight, index) => {
                const info = getHighlightInfo(highlight.type)
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Highlight Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${info.color}`}>
                          {info.emoji} {info.label}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Round {highlight.round} vs <PlayerName name={highlight.opponent} />
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${
                        highlight.result === '1-0'
                          ? highlight.color === 'white' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          : highlight.result === '0-1'
                          ? highlight.color === 'black' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          : 'text-gray-500'
                      }`}>
                        {highlight.result}
                      </span>
                    </div>

                    {/* Highlight Content */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Move Info */}
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Move Played</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                              {highlight.moveNumber}. {highlight.color === 'black' && '...'}{highlight.move}
                            </div>
                          </div>

                          {highlight.bestMove !== highlight.move && (
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Best Move</div>
                              <div className="text-lg text-emerald-600 dark:text-emerald-400 font-mono">
                                {highlight.bestMove}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-6">
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Eval Before</div>
                              <div className="text-lg font-mono">{highlight.evalBefore}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Eval After</div>
                              <div className="text-lg font-mono">{highlight.evalAfter}</div>
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-300 mt-4">
                            {highlight.description}
                          </p>
                        </div>

                        {/* Position Links */}
                        <div className="space-y-4">
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">FEN Position</div>
                            <code className="text-xs text-gray-700 dark:text-gray-300 break-all">
                              {highlight.fen}
                            </code>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <a
                              href={getLichessAnalysisUrl(highlight.fen)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              Analyze Position
                            </a>
                            <a
                              href={highlight.gameUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Full Game
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* No Highlights */}
        {player.highlights.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400">
              No highlight moments recorded for this player yet.
            </div>
          </div>
        )}

        {/* Back to Stats */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <Link
            href="/stats/highlights"
            className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Players
          </Link>
          <Link
            href="/stats"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Tournament Statistics
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
