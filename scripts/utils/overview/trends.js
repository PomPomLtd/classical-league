 
/**
 * Trends Calculator
 *
 * Calculates trends and evolution over rounds
 */

/**
 * Calculate trends across all rounds
 * @param {Array<Object>} rounds - Array of round data (must be sorted by round number)
 * @returns {Object} Trend data
 */
function calculateTrends(rounds) {
  const trends = {
    averageACPLByRound: [],
    averageAccuracyByRound: [],
    averageGameLengthByRound: [],
    e4PercentageByRound: [],
    d4PercentageByRound: [],
    drawRateByRound: [],
    whiteWinRateByRound: [],
    blackWinRateByRound: [],
    blundersPerGameByRound: [],
    mistakesPerGameByRound: [],
    avgQueenDistanceByRound: []
  }

  rounds.forEach(round => {
    // Average ACPL
    if (round.analysis?.games) {
      const acplValues = []
      round.analysis.games.forEach(game => {
        if (game.whiteACPL !== undefined && game.whiteACPL !== null) {
          acplValues.push(game.whiteACPL)
        }
        if (game.blackACPL !== undefined && game.blackACPL !== null) {
          acplValues.push(game.blackACPL)
        }
      })
      const avgACPL = acplValues.length > 0
        ? acplValues.reduce((sum, v) => sum + v, 0) / acplValues.length
        : null
      trends.averageACPLByRound.push(avgACPL !== null ? Math.round(avgACPL * 10) / 10 : null)

      // Average Accuracy
      const accuracyValues = []
      round.analysis.games.forEach(game => {
        if (game.whiteAccuracy !== undefined && game.whiteAccuracy !== null) {
          accuracyValues.push(game.whiteAccuracy)
        }
        if (game.blackAccuracy !== undefined && game.blackAccuracy !== null) {
          accuracyValues.push(game.blackAccuracy)
        }
      })
      const avgAccuracy = accuracyValues.length > 0
        ? accuracyValues.reduce((sum, v) => sum + v, 0) / accuracyValues.length
        : null
      trends.averageAccuracyByRound.push(avgAccuracy !== null ? Math.round(avgAccuracy * 10) / 10 : null)

      // Blunders per game
      let totalBlunders = 0
      round.analysis.games.forEach(game => {
        totalBlunders += (game.whiteMoveQuality?.blunders || 0) + (game.blackMoveQuality?.blunders || 0)
      })
      const blundersPerGame = round.overview?.totalGames > 0
        ? totalBlunders / round.overview.totalGames
        : 0
      trends.blundersPerGameByRound.push(Math.round(blundersPerGame * 10) / 10)

      // Mistakes per game
      let totalMistakes = 0
      round.analysis.games.forEach(game => {
        totalMistakes += (game.whiteMoveQuality?.mistakes || 0) + (game.blackMoveQuality?.mistakes || 0)
      })
      const mistakesPerGame = round.overview?.totalGames > 0
        ? totalMistakes / round.overview.totalGames
        : 0
      trends.mistakesPerGameByRound.push(Math.round(mistakesPerGame * 10) / 10)
    } else {
      trends.averageACPLByRound.push(null)
      trends.averageAccuracyByRound.push(null)
      trends.blundersPerGameByRound.push(null)
      trends.mistakesPerGameByRound.push(null)
    }

    // Average game length
    const avgLength = round.overview?.averageGameLength || null
    trends.averageGameLengthByRound.push(avgLength !== null ? Math.round(avgLength * 10) / 10 : null)

    // Opening percentages (e4 vs d4)
    if (round.openings?.firstMoves) {
      const e4Pct = round.openings.firstMoves.e4?.percentage || 0
      const d4Pct = round.openings.firstMoves.d4?.percentage || 0
      trends.e4PercentageByRound.push(Math.round(e4Pct * 10) / 10)
      trends.d4PercentageByRound.push(Math.round(d4Pct * 10) / 10)
    } else {
      trends.e4PercentageByRound.push(null)
      trends.d4PercentageByRound.push(null)
    }

    // Win rates
    if (round.results) {
      const drawRate = round.results.drawPercentage || 0
      const whiteWinRate = round.results.whiteWinPercentage || 0
      const blackWinRate = round.results.blackWinPercentage || 0
      trends.drawRateByRound.push(Math.round(drawRate * 10) / 10)
      trends.whiteWinRateByRound.push(Math.round(whiteWinRate * 10) / 10)
      trends.blackWinRateByRound.push(Math.round(blackWinRate * 10) / 10)
    } else {
      trends.drawRateByRound.push(null)
      trends.whiteWinRateByRound.push(null)
      trends.blackWinRateByRound.push(null)
    }

    // Average queen distance (if we have sporty queen data)
    if (round.funStats?.sportyQueen?.distance) {
      trends.avgQueenDistanceByRound.push(Math.round(round.funStats.sportyQueen.distance))
    } else {
      trends.avgQueenDistanceByRound.push(null)
    }
  })

  return trends
}

module.exports = {
  calculateTrends
}
