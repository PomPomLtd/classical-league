'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BoardHeatmap } from '@/components/board-heatmap'

interface StatsData {
  roundNumber: number
  seasonNumber: number
  generatedAt: string
  overview: {
    totalGames: number
    totalMoves: number
    averageGameLength: number
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
  gamePhases: {
    averageOpening: number
    averageMiddlegame: number
    averageEndgame: number
    longestOpening: {
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
  results: {
    whiteWins: number
    blackWins: number
    draws: number
    whiteWinPercentage: number
    blackWinPercentage: number
    drawPercentage: number
  }
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
  tactics: {
    totalCaptures: number
    enPassantGames: Array<{
      white: string
      black: string
      count: number
    }>
    promotions: number
    castling: {
      kingside: number
      queenside: number
    }
    bloodiestGame: {
      captures: number
      gameIndex: number
      white: string
      black: string
    }
    quietestGame: {
      captures: number
      gameIndex: number
      white: string
      black: string
    }
    longestNonCaptureStreak: {
      moves: number
      gameIndex: number
      white: string
      black: string
    }
  }
  pieces: {
    activity: {
      pawns: number
      knights: number
      bishops: number
      rooks: number
      queens: number
      kings: number
    }
    captured: {
      pawns: number
      knights: number
      bishops: number
      rooks: number
      queens: number
    }
    survivalRate: {
      rooks: number
      queens: number
      bishops: number
      knights: number
    }
  }
  checkmates: {
    byPiece: Record<string, number>
    fastest: {
      moves: number
      gameIndex: number
      white: string
      black: string
      winner: string
    } | null
  }
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
  awards: {
    bloodbath: {
      white: string
      black: string
      captures: number
    }
    pacifist: {
      white: string
      black: string
      captures: number
    }
    speedDemon: {
      white: string
      black: string
      moves: number
      winner: string
    } | null
    endgameWizard: {
      white: string
      black: string
      endgameMoves: number
    }
    openingSprinter: {
      white: string
      black: string
      openingMoves: number
    } | null
  }
}

export default function RoundStatsPage() {
  const params = useParams()
  const roundNumber = parseInt(params.roundNumber as string)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [heatmapMode, setHeatmapMode] = useState<'popularity' | 'captures'>('popularity')
  const [nextRoundExists, setNextRoundExists] = useState(false)

  useEffect(() => {
    fetchRoundStats()
    checkNextRoundExists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundNumber])

  const fetchRoundStats = async () => {
    try {
      const response = await fetch(`/stats/season-2-round-${roundNumber}.json`)
      if (!response.ok) {
        throw new Error('Stats not found for this round')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const checkNextRoundExists = async () => {
    if (roundNumber >= 7) {
      setNextRoundExists(false)
      return
    }
    try {
      const response = await fetch(`/stats/season-2-round-${roundNumber + 1}.json`, { method: 'HEAD' })
      setNextRoundExists(response.ok)
    } catch {
      setNextRoundExists(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-gray-500 dark:text-gray-400">Loading round statistics...</div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-12">
          <div className="text-red-500 dark:text-red-400 mb-4">
            {error || 'Statistics not available'}
          </div>
          <Link href="/stats" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            ← Back to Statistics
          </Link>
        </div>
      </div>
    )
  }

  const StatCard = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Link href="/stats" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mb-2 inline-block">
            ← Back to Statistics
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Round {stats.roundNumber} Statistics
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Generated on {new Date(stats.generatedAt).toLocaleDateString('de-CH')}
              </p>
            </div>

            {/* Round Navigation */}
            <div className="flex items-center space-x-2">
              {roundNumber > 1 && (
                <Link
                  href={`/stats/round/${roundNumber - 1}`}
                  className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Round {roundNumber - 1}</span>
                  <span className="sm:hidden">Rd {roundNumber - 1}</span>
                </Link>
              )}
              {nextRoundExists && (
                <Link
                  href={`/stats/round/${roundNumber + 1}`}
                  className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="hidden sm:inline">Round {roundNumber + 1}</span>
                  <span className="sm:hidden">Rd {roundNumber + 1}</span>
                  <svg className="w-4 h-4 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="text-3xl font-bold">{stats.overview.totalGames}</div>
            <div className="text-blue-100 mt-1">Games Played</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="text-3xl font-bold">{stats.overview.totalMoves.toLocaleString()}</div>
            <div className="text-purple-100 mt-1">Total Moves</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="text-3xl font-bold">{Math.round(stats.overview.averageGameLength)}</div>
            <div className="text-green-100 mt-1">Avg Game Length</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
            <div className="text-3xl font-bold">{stats.tactics.totalCaptures}</div>
            <div className="text-orange-100 mt-1">Total Captures</div>
          </div>
        </div>

        {/* Results */}
        <StatCard title="📊 Game Results">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.results.whiteWins}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">White Wins</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">{stats.results.whiteWinPercentage.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.results.blackWins}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Black Wins</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">{stats.results.blackWinPercentage.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.results.draws}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Draws</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">{stats.results.drawPercentage.toFixed(1)}%</div>
            </div>
          </div>
        </StatCard>

        {/* Awards */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-yellow-900 dark:to-orange-900 rounded-lg shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">🏆 Round Awards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-lg font-semibold mb-2">🩸 Bloodbath Award</div>
              <div className="text-yellow-100 dark:text-yellow-200">
                {stats.awards.bloodbath.white} vs {stats.awards.bloodbath.black}
              </div>
              <div className="text-sm text-yellow-200 dark:text-yellow-300 mt-1">{stats.awards.bloodbath.captures} captures!</div>
            </div>
            <div>
              <div className="text-lg font-semibold mb-2">🕊️ Pacifist Award</div>
              <div className="text-yellow-100 dark:text-yellow-200">
                {stats.awards.pacifist.white} vs {stats.awards.pacifist.black}
              </div>
              <div className="text-sm text-yellow-200 dark:text-yellow-300 mt-1">{stats.awards.pacifist.captures} captures</div>
            </div>
            {stats.awards.speedDemon && (
              <div>
                <div className="text-lg font-semibold mb-2">⚡ Speed Demon</div>
                <div className="text-yellow-100 dark:text-yellow-200">
                  {stats.awards.speedDemon.white} vs {stats.awards.speedDemon.black}
                </div>
                <div className="text-sm text-yellow-200 dark:text-yellow-300 mt-1">Mate in {stats.awards.speedDemon.moves} moves</div>
              </div>
            )}
            <div>
              <div className="text-lg font-semibold mb-2">🧙 Endgame Wizard</div>
              <div className="text-yellow-100 dark:text-yellow-200">
                {stats.awards.endgameWizard.white} vs {stats.awards.endgameWizard.black}
              </div>
              <div className="text-sm text-yellow-200 dark:text-yellow-300 mt-1">{stats.awards.endgameWizard.endgameMoves} endgame moves!</div>
            </div>
          </div>
        </div>

        {/* Board Heatmap */}
        <StatCard title="🗺️ Board Heatmap">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.boardHeatmap.bloodiestSquare.square}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bloodiest Square</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stats.boardHeatmap.bloodiestSquare.captures} captures</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.boardHeatmap.mostPopularSquare.square}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Most Popular</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stats.boardHeatmap.mostPopularSquare.visits} visits</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.boardHeatmap.leastPopularSquare.square}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Least Popular</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stats.boardHeatmap.leastPopularSquare.visits} visits</div>
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

              <div className="flex justify-center">
                <BoardHeatmap
                  top5Popular={stats.boardHeatmap.top5Popular}
                  top5Bloodiest={stats.boardHeatmap.top5Bloodiest}
                  mode={heatmapMode}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Top 5 Bloodiest Squares</h4>
                <div className="space-y-2">
                  {stats.boardHeatmap.top5Bloodiest.map((sq, idx) => (
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
                  {stats.boardHeatmap.top5Popular.map((sq, idx) => (
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

            {stats.boardHeatmap.quietestSquares.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Never Visited:</span> {stats.boardHeatmap.quietestSquares.join(', ')}
                </div>
              </div>
            )}
          </div>
        </StatCard>

        {/* Game Phases */}
        <StatCard title="⏱️ Game Phases">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.gamePhases.averageOpening)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Opening</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.gamePhases.averageMiddlegame)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Middlegame</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.gamePhases.averageEndgame)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Endgame</div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600 dark:text-gray-400">Longest Opening:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.gamePhases.longestOpening.moves} moves</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">{stats.gamePhases.longestOpening.game}</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600 dark:text-gray-400">Longest Middlegame:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.gamePhases.longestMiddlegame.moves} moves</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">{stats.gamePhases.longestMiddlegame.game}</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600 dark:text-gray-400">Longest Endgame:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.gamePhases.longestEndgame.moves} moves</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">{stats.gamePhases.longestEndgame.game}</div>
            </div>
          </div>
        </StatCard>

        {/* Tactics & Openings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard title="⚔️ Tactical Stats">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Captures:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.tactics.totalCaptures}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Promotions:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.tactics.promotions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Kingside Castling:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.tactics.castling.kingside}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Queenside Castling:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.tactics.castling.queenside}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">En Passant Games:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.tactics.enPassantGames.length}</span>
              </div>
            </div>
          </StatCard>

          <StatCard title="♟️ Opening Moves">
            <div className="space-y-3">
              {Object.entries(stats.openings.firstMoves)
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
          </StatCard>
        </div>

        {/* Piece Activity */}
        <StatCard title="👑 Piece Activity">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(stats.pieces.activity).map(([piece, moves]) => (
              <div key={piece} className="text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{moves}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{piece}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Pieces Captured</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(stats.pieces.captured).map(([piece, count]) => (
                <div key={piece} className="text-center text-sm">
                  <div className="font-bold text-gray-900 dark:text-white">{count}</div>
                  <div className="text-gray-600 dark:text-gray-400 capitalize">{piece}</div>
                </div>
              ))}
            </div>
          </div>
        </StatCard>

        {/* Extreme Games */}
        <StatCard title="🎯 Notable Games">
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">Longest Game</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {stats.overview.longestGame.white} vs {stats.overview.longestGame.black}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {stats.overview.longestGame.moves} moves • Result: {stats.overview.longestGame.result}
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Shortest Game</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {stats.overview.shortestGame.white} vs {stats.overview.shortestGame.black}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {stats.overview.shortestGame.moves} moves • Result: {stats.overview.shortestGame.result}
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="font-semibold text-green-900 dark:text-green-300 mb-1">Longest Non-Capture Streak</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {stats.tactics.longestNonCaptureStreak.white} vs {stats.tactics.longestNonCaptureStreak.black}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {stats.tactics.longestNonCaptureStreak.moves} consecutive moves without captures
              </div>
            </div>
          </div>
        </StatCard>

        {/* Broadcast Link */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                Watch the Games
              </h3>
              <div className="mt-2 text-sm text-indigo-700 dark:text-indigo-300">
                <p className="mb-2">View all games from this round on the Lichess broadcast:</p>
                <a
                  href="https://lichess.org/broadcast/classical-league-season-2/LVSkiDuJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  View Broadcast on Lichess
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
