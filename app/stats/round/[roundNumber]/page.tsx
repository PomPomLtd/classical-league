'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { RoundHeader } from '@/components/stats/round-header'
import { OverviewStats } from '@/components/stats/overview-stats'
import { ResultsBreakdown } from '@/components/stats/results-breakdown'
import { AwardsSection } from '@/components/stats/awards-section'
import { GamePhases } from '@/components/stats/game-phases'
import { TacticsSection } from '@/components/stats/tactics-section'
import { OpeningsSection } from '@/components/stats/openings-section'
import { PieceStats } from '@/components/stats/piece-stats'
import { NotableGames } from '@/components/stats/notable-games'
import { FunStats } from '@/components/stats/fun-stats'
import { CheckmatesSection } from '@/components/stats/checkmates-section'
import { BoardHeatmapSection } from '@/components/stats/board-heatmap-section'
import { AnalysisSection } from '@/components/stats/analysis-section'

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
      eco: string | null
      name: string | null
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
    totalUnderpromotions: number
    underpromotions: Array<{
      gameIndex: number
      moveNumber: number
      promotedTo: string
      color: string
      san: string
      white: string
      black: string
    }>
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
  funStats?: {
    fastestQueenTrade: {
      moves: number
      gameIndex: number
      white: string
      black: string
    } | null
    slowestQueenTrade: {
      moves: number
      gameIndex: number
      white: string
      black: string
    } | null
    longestCaptureSequence: {
      length: number
      gameIndex: number
      startMove: number
      white: string
      black: string
    } | null
    longestCheckSequence: {
      length: number
      gameIndex: number
      startMove: number
      white: string
      black: string
    } | null
    pawnStorm: {
      count: number
      gameIndex: number
      white: string
      black: string
    } | null
    pieceLoyalty: {
      moves: number
      gameIndex: number
      piece: string
      square: string
      white: string
      black: string
    } | null
    squareTourist: {
      squares: number
      gameIndex: number
      piece: string
      color: string
      startSquare: string
      white: string
      black: string
    } | null
    castlingRace: {
      moves: number
      gameIndex: number
      winner: string
      white: string
      black: string
    } | null
    openingHipster: {
      gameIndex: number
      eco: string
      name: string
      moves: string
      white: string
      black: string
    } | null
    dadbodShuffler: {
      moves: number
      gameIndex: number
      color: string
      white: string
      black: string
    } | null
    sportyQueen: {
      distance: number
      gameIndex: number
      color: string
      white: string
      black: string
    } | null
    edgeLord: {
      moves: number
      gameIndex: number
      color: string
      white: string
      black: string
    } | null
    rookLift: {
      moveNumber: number
      gameIndex: number
      color: string
      rook: string
      square: string
      white: string
      black: string
    } | null
    centerStage: {
      moves: number
      gameIndex: number
      piece: string
      startSquare: string
      color: string
      white: string
      black: string
    } | null
    darkLord: {
      captures: number
      gameIndex: number
      color: string
      white: string
      black: string
    } | null
    chickenAward: {
      retreats: number
      gameIndex: number
      color: string
      white: string
      black: string
    } | null
    homebody?: {
      white: string
      black: string
      player: string
      playerName: string
      piecesInEnemy: number
      description: string
    }
    lateBloomer?: {
      white: string
      black: string
      player: string
      playerName: string
      moveNumber: number
      description: string
    }
    quickDraw?: {
      white: string
      black: string
      player: string
      playerName: string
      moveNumber: number
      description: string
    }
    crosshairs?: {
      white: string
      black: string
      square: string
      attackers: number
      whiteAttackers: number
      blackAttackers: number
      moveNumber: number
      move: string
      description: string
    }
    longestTension?: {
      white: string
      black: string
      moves: number
      squares: string
      startMove: number
      endMove: number
      description: string
    }
  }
  analysis?: {
    games: Array<{
      gameIndex: number
      white: string
      black: string
      whiteACPL: number
      blackACPL: number
      whiteAccuracy: number
      blackAccuracy: number
      whiteMoveQuality: {
        blunders: number
        mistakes: number
        inaccuracies: number
        good: number
        excellent: number
      }
      blackMoveQuality: {
        blunders: number
        mistakes: number
        inaccuracies: number
        good: number
        excellent: number
      }
      biggestBlunder: {
        moveNumber: number
        player: string
        cpLoss: number
        move: string
        evalBefore: number
        evalAfter: number
      } | null
    }>
    summary: {
      accuracyKing: {
        player: string
        accuracy: number
        acpl: number
        white: string
        black: string
        gameIndex: number
      } | null
      biggestBlunder: {
        moveNumber: number
        player: string
        cpLoss: number
        move: string
        white: string
        black: string
        gameIndex: number
      } | null
      lowestACPL: {
        player: string
        acpl: number
        accuracy: number
        white: string
        black: string
        gameIndex: number
      } | null
      highestACPL: {
        player: string
        acpl: number
        accuracy: number
        white: string
        black: string
        gameIndex: number
      } | null
      lowestCombinedACPL: {
        combinedACPL: number
        whiteACPL: number
        blackACPL: number
        white: string
        black: string
        gameIndex: number
      } | null
      highestCombinedACPL: {
        combinedACPL: number
        whiteACPL: number
        blackACPL: number
        white: string
        black: string
        gameIndex: number
      } | null
      comebackKing: {
        player: string
        swing: number
        evalFrom: number
        evalTo: number
        moveNumber: number
        white: string
        black: string
        gameIndex: number
      } | null
      luckyEscape: {
        player: string
        escapeAmount: number
        evalBefore: number
        evalAfter: number
        moveNumber: number
        white: string
        black: string
        gameIndex: number
      } | null
    }
  }
}

export default function RoundStatsPage() {
  const params = useParams()
  const roundNumber = parseInt(params.roundNumber as string)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading statistics...</div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Stats Not Available</h2>
          <p className="text-gray-600 dark:text-gray-400">{error || 'Failed to load statistics'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <RoundHeader
            roundNumber={stats.roundNumber}
            generatedAt={stats.generatedAt}
            nextRoundExists={nextRoundExists}
          />

          <OverviewStats overview={stats.overview} />

          <ResultsBreakdown results={stats.results} />

          <AwardsSection awards={stats.awards} />

          {stats.analysis && <AnalysisSection analysis={stats.analysis} />}

          <FunStats funStats={stats.funStats} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GamePhases gamePhases={stats.gamePhases} />
            <TacticsSection tactics={stats.tactics} />
          </div>

          <OpeningsSection openings={stats.openings} />

          <PieceStats pieces={stats.pieces} />

          <NotableGames
            overview={stats.overview}
            longestNonCaptureStreak={stats.tactics.longestNonCaptureStreak}
          />

          <CheckmatesSection checkmates={stats.checkmates} />

          <BoardHeatmapSection boardHeatmap={stats.boardHeatmap} />
        </div>
      </div>
    </div>
  )
}
