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

  // Total blunders, mistakes, inaccuracies
  const totalWhiteBlunders = games.reduce((sum, g) => sum + g.whiteMoveQuality.blunders, 0)
  const totalBlackBlunders = games.reduce((sum, g) => sum + g.blackMoveQuality.blunders, 0)
  const totalWhiteMistakes = games.reduce((sum, g) => sum + g.whiteMoveQuality.mistakes, 0)
  const totalBlackMistakes = games.reduce((sum, g) => sum + g.blackMoveQuality.mistakes, 0)
  const totalWhiteInaccuracies = games.reduce((sum, g) => sum + g.whiteMoveQuality.inaccuracies, 0)
  const totalBlackInaccuracies = games.reduce((sum, g) => sum + g.blackMoveQuality.inaccuracies, 0)

  // Find worst accuracy game
  const worstAccuracyGame = games.reduce((worst, game) => {
    const gameAvgAccuracy = (game.whiteAccuracy + game.blackAccuracy) / 2
    const worstAvgAccuracy = worst ? (worst.whiteAccuracy + worst.blackAccuracy) / 2 : Infinity
    return gameAvgAccuracy < worstAvgAccuracy ? game : worst
  }, games[0])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">🔬 Stockfish Analysis</h2>

      {/* Accuracy King Award */}
      {summary.accuracyKing && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 rounded-lg border-2 border-yellow-400 dark:border-yellow-600">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">👑</span>
            <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200">Accuracy King</h3>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
              {summary.accuracyKing.player === 'white'
                ? summary.accuracyKing.white
                : summary.accuracyKing.black}
            </p>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-yellow-700 dark:text-yellow-300">Accuracy:</span>{' '}
                <span className="font-bold text-yellow-900 dark:text-yellow-100">{summary.accuracyKing.accuracy}%</span>
              </div>
              <div>
                <span className="text-yellow-700 dark:text-yellow-300">ACPL:</span>{' '}
                <span className="font-bold text-yellow-900 dark:text-yellow-100">{summary.accuracyKing.acpl}</span>
              </div>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              vs {summary.accuracyKing.player === 'white'
                ? summary.accuracyKing.black
                : summary.accuracyKing.white}
              {' '}(Game {summary.accuracyKing.gameIndex + 1})
            </p>
          </div>
        </div>
      )}

      {/* Biggest Blunder Award */}
      {summary.biggestBlunder && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-lg border-2 border-red-400 dark:border-red-600">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">💥</span>
            <h3 className="text-xl font-bold text-red-900 dark:text-red-200">Biggest Blunder</h3>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-red-900 dark:text-red-100">
              {summary.biggestBlunder.player === 'white'
                ? summary.biggestBlunder.white
                : summary.biggestBlunder.black}
            </p>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-red-700 dark:text-red-300">Move:</span>{' '}
                <span className="font-bold font-mono text-red-900 dark:text-red-100">
                  {summary.biggestBlunder.moveNumber}. {summary.biggestBlunder.move}
                </span>
              </div>
              <div>
                <span className="text-red-700 dark:text-red-300">Loss:</span>{' '}
                <span className="font-bold text-red-900 dark:text-red-100">{summary.biggestBlunder.cpLoss} cp</span>
              </div>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              vs {summary.biggestBlunder.player === 'white'
                ? summary.biggestBlunder.black
                : summary.biggestBlunder.white}
              {' '}(Game {summary.biggestBlunder.gameIndex + 1})
            </p>
          </div>
        </div>
      )}

      {/* ACPL Awards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lowest Individual ACPL (Best Performance) */}
        {summary.lowestACPL && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border-2 border-green-400 dark:border-green-600">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">⭐</span>
              <h3 className="text-lg font-bold text-green-900 dark:text-green-200">Best Performance</h3>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-green-900 dark:text-green-100">
                {summary.lowestACPL.player === 'white'
                  ? summary.lowestACPL.white
                  : summary.lowestACPL.black}
              </p>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-green-700 dark:text-green-300">ACPL:</span>{' '}
                  <span className="font-bold text-green-900 dark:text-green-100">{summary.lowestACPL.acpl}</span>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">Accuracy:</span>{' '}
                  <span className="font-bold text-green-900 dark:text-green-100">{summary.lowestACPL.accuracy}%</span>
                </div>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">Game {summary.lowestACPL.gameIndex + 1}</p>
            </div>
          </div>
        )}

        {/* Highest Individual ACPL (Worst Performance) */}
        {summary.highestACPL && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg border-2 border-orange-400 dark:border-orange-600">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">😰</span>
              <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200">Roughest Day</h3>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-orange-900 dark:text-orange-100">
                {summary.highestACPL.player === 'white'
                  ? summary.highestACPL.white
                  : summary.highestACPL.black}
              </p>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-orange-700 dark:text-orange-300">ACPL:</span>{' '}
                  <span className="font-bold text-orange-900 dark:text-orange-100">{summary.highestACPL.acpl}</span>
                </div>
                <div>
                  <span className="text-orange-700 dark:text-orange-300">Accuracy:</span>{' '}
                  <span className="font-bold text-orange-900 dark:text-orange-100">{summary.highestACPL.accuracy}%</span>
                </div>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300">Game {summary.highestACPL.gameIndex + 1}</p>
            </div>
          </div>
        )}

        {/* Lowest Combined ACPL (Cleanest Game) */}
        {summary.lowestCombinedACPL && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-lg border-2 border-blue-400 dark:border-blue-600">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">💎</span>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200">Cleanest Game</h3>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                {summary.lowestCombinedACPL.white} vs {summary.lowestCombinedACPL.black}
              </p>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Combined ACPL:</span>{' '}
                  <span className="font-bold text-blue-900 dark:text-blue-100">{summary.lowestCombinedACPL.combinedACPL.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                W: {summary.lowestCombinedACPL.whiteACPL} / B: {summary.lowestCombinedACPL.blackACPL}
              </p>
            </div>
          </div>
        )}

        {/* Highest Combined ACPL (Bloodbath) */}
        {summary.highestCombinedACPL && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border-2 border-purple-400 dark:border-purple-600">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🎢</span>
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200">Wildest Game</h3>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                {summary.highestCombinedACPL.white} vs {summary.highestCombinedACPL.black}
              </p>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-purple-700 dark:text-purple-300">Combined ACPL:</span>{' '}
                  <span className="font-bold text-purple-900 dark:text-purple-100">{summary.highestCombinedACPL.combinedACPL.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                W: {summary.highestCombinedACPL.whiteACPL} / B: {summary.highestCombinedACPL.blackACPL}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Overall Statistics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Overall Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg White Accuracy</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgWhiteAccuracy.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ACPL: {avgWhiteACPL.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Black Accuracy</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgBlackAccuracy.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ACPL: {avgBlackACPL.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Blunders</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {totalWhiteBlunders + totalBlackBlunders}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              W: {totalWhiteBlunders} / B: {totalBlackBlunders}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Mistakes</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {totalWhiteMistakes + totalBlackMistakes}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              W: {totalWhiteMistakes} / B: {totalBlackMistakes}
            </p>
          </div>
        </div>
      </div>

      {/* Move Quality Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Move Quality Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Inaccuracies (20-49 cp loss)</p>
            <p className="font-bold text-gray-900 dark:text-white">
              White: {totalWhiteInaccuracies} / Black: {totalBlackInaccuracies}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Mistakes (50-99 cp loss)</p>
            <p className="font-bold text-orange-600 dark:text-orange-400">
              White: {totalWhiteMistakes} / Black: {totalBlackMistakes}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Blunders (100+ cp loss)</p>
            <p className="font-bold text-red-600 dark:text-red-400">
              White: {totalWhiteBlunders} / Black: {totalBlackBlunders}
            </p>
          </div>
        </div>
      </div>

      {/* Worst Accuracy Game */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">🤦 Most Inaccurate Game</h3>
        <p className="font-semibold mb-2 text-gray-900 dark:text-white">
          {worstAccuracyGame.white} vs {worstAccuracyGame.black}
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">White Accuracy</p>
            <p className="font-bold text-gray-900 dark:text-white">{worstAccuracyGame.whiteAccuracy.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Blunders: {worstAccuracyGame.whiteMoveQuality.blunders}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Black Accuracy</p>
            <p className="font-bold text-gray-900 dark:text-white">{worstAccuracyGame.blackAccuracy.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Blunders: {worstAccuracyGame.blackMoveQuality.blunders}
            </p>
          </div>
        </div>
      </div>

      {/* Methodology Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
        <p className="font-semibold mb-1">📖 Analysis Methodology</p>
        <p className="text-blue-800 dark:text-blue-300">
          Powered by Stockfish 17 at depth 15, analyzing every 2nd move.
          Accuracy calculated using Lichess formula based on win percentage loss. ACPL = Average Centipawn Loss.
        </p>
      </div>
    </div>
  )
}
