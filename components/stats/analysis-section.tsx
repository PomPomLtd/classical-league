import { StatCard } from './stat-card'
import { StatBox } from './stat-box'
import { PlayerName, PlayerVs } from './player-name'

interface AnalysisData {
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

interface AnalysisSectionProps {
  analysis: AnalysisData
}

export function AnalysisSection({ analysis }: AnalysisSectionProps) {
  const { summary, games } = analysis

  // Calculate average accuracy across all games
  const avgWhiteAccuracy = games.reduce((sum, g) => sum + g.whiteAccuracy, 0) / games.length
  const avgBlackAccuracy = games.reduce((sum, g) => sum + g.blackAccuracy, 0) / games.length
  const avgWhiteACPL = games.reduce((sum, g) => sum + g.whiteACPL, 0) / games.length
  const avgBlackACPL = games.reduce((sum, g) => sum + g.blackACPL, 0) / games.length

  // Total blunders, mistakes
  const totalWhiteBlunders = games.reduce((sum, g) => sum + g.whiteMoveQuality.blunders, 0)
  const totalBlackBlunders = games.reduce((sum, g) => sum + g.blackMoveQuality.blunders, 0)
  const totalWhiteMistakes = games.reduce((sum, g) => sum + g.whiteMoveQuality.mistakes, 0)
  const totalBlackMistakes = games.reduce((sum, g) => sum + g.blackMoveQuality.mistakes, 0)

  return (
    <StatCard title="🔬 Stockfish Analysis (Experimental)">
      {/* Top Row: Featured Stats (2 per row on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {summary.accuracyKing && (
          <StatBox
            title="GM Energy"
            emoji="🎖️"
            player={<PlayerName name={summary.accuracyKing.player === 'white' ? summary.accuracyKing.white : summary.accuracyKing.black} />}
            details={
              <div className="flex flex-col gap-1">
                <span>Accuracy: <strong className="text-yellow-900 dark:text-yellow-200">{summary.accuracyKing.accuracy}%</strong></span>
                <span>ACPL: <strong className="text-yellow-900 dark:text-yellow-200">{summary.accuracyKing.acpl}</strong></span>
              </div>
            }
            colorScheme="yellow"
            featured
          />
        )}

        {summary.biggestBlunder && (
          <StatBox
            title="Blunder of the Round"
            emoji="💥"
            player={<PlayerName name={summary.biggestBlunder.player === 'white' ? summary.biggestBlunder.white : summary.biggestBlunder.black} />}
            details={
              <div className="flex flex-col gap-1">
                <span>Move <strong className="font-mono text-red-900 dark:text-red-200">{summary.biggestBlunder.moveNumber}. {summary.biggestBlunder.move}</strong></span>
                <span><strong className="text-red-900 dark:text-red-200">{summary.biggestBlunder.cpLoss} cp</strong></span>
              </div>
            }
            colorScheme="red"
            featured
          />
        )}

        {summary.comebackKing && (
          <StatBox
            title="Comeback King"
            emoji="🎯"
            player={<PlayerName name={summary.comebackKing.player === 'white' ? summary.comebackKing.white : summary.comebackKing.black} />}
            details={
              <div className="flex flex-col gap-1">
                <span>Swing: <strong className="text-green-900 dark:text-green-200">{summary.comebackKing.swing} cp</strong></span>
                <span className="text-xs">From {summary.comebackKing.evalFrom} to {summary.comebackKing.evalTo}</span>
              </div>
            }
            colorScheme="green"
            featured
          />
        )}

        {summary.luckyEscape && (
          <StatBox
            title="Lucky Escape"
            emoji="😱"
            player={<PlayerName name={summary.luckyEscape.player === 'white' ? summary.luckyEscape.white : summary.luckyEscape.black} />}
            details={
              <div className="flex flex-col gap-1">
                <span>Escaped: <strong className="text-indigo-900 dark:text-indigo-200">{summary.luckyEscape.escapeAmount} cp</strong></span>
                <span className="text-xs">Opponent missed advantage</span>
              </div>
            }
            colorScheme="indigo"
            featured
          />
        )}
      </div>

      {/* ACPL Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {summary.lowestACPL && (
          <StatBox
            title="Best Performance"
            emoji="⭐"
            player={<PlayerName name={summary.lowestACPL.player === 'white' ? summary.lowestACPL.white : summary.lowestACPL.black} />}
            details={<>ACPL: <strong>{summary.lowestACPL.acpl}</strong> / Accuracy: <strong>{summary.lowestACPL.accuracy}%</strong></>}
            colorScheme="green"
          />
        )}

        {summary.highestACPL && (
          <StatBox
            title="Roughest Day"
            emoji="😰"
            player={<PlayerName name={summary.highestACPL.player === 'white' ? summary.highestACPL.white : summary.highestACPL.black} />}
            details={<>ACPL: <strong>{summary.highestACPL.acpl}</strong> / Accuracy: <strong>{summary.highestACPL.accuracy}%</strong></>}
            colorScheme="orange"
          />
        )}

        {summary.lowestCombinedACPL && (
          <StatBox
            title="Cleanest Game"
            emoji="💎"
            player={<PlayerVs white={summary.lowestCombinedACPL.white} black={summary.lowestCombinedACPL.black} />}
            details={<>Combined ACPL: <strong>{summary.lowestCombinedACPL.combinedACPL.toFixed(1)}</strong></>}
            colorScheme="blue"
          />
        )}

        {summary.highestCombinedACPL && (
          <StatBox
            title="Wildest Game"
            emoji="🎢"
            player={<PlayerVs white={summary.highestCombinedACPL.white} black={summary.highestCombinedACPL.black} />}
            details={<>Combined ACPL: <strong>{summary.highestCombinedACPL.combinedACPL.toFixed(1)}</strong></>}
            colorScheme="purple"
          />
        )}
      </div>

      {/* Overall Statistics */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Overall Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg White Accuracy</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{avgWhiteAccuracy.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ACPL: {avgWhiteACPL.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg Black Accuracy</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{avgBlackAccuracy.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ACPL: {avgBlackACPL.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Blunders</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {totalWhiteBlunders + totalBlackBlunders}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              W: {totalWhiteBlunders} / B: {totalBlackBlunders}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Mistakes</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {totalWhiteMistakes + totalBlackMistakes}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              W: {totalWhiteMistakes} / B: {totalBlackMistakes}
            </p>
          </div>
        </div>
      </div>

      {/* Methodology Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700 mt-4">
        <p className="font-semibold mb-1">📖 Analysis Methodology</p>
        <p className="text-blue-800 dark:text-blue-300">
          Powered by Stockfish 17 at depth 15, analyzing all moves.
          Accuracy calculated using Lichess formula based on win percentage loss. ACPL = Average Centipawn Loss.
        </p>
      </div>
    </StatCard>
  )
}
