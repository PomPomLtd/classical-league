 
/**
 * Hall of Fame Calculator
 *
 * Finds superlatives across all rounds (best, worst, most extreme stats)
 */

/**
 * Find Hall of Fame entries across all rounds
 * @param {Array<Object>} rounds - Array of round data
 * @returns {Object} Hall of Fame superlatives
 */
function findHallOfFame(rounds) {
  const hallOfFame = {
    cleanestGame: null,
    wildestGame: null,
    biggestBlunder: null,
    mostAccurate: null,
    worstACPL: null,
    longestGame: null,
    shortestGame: null,
    sportiestQueen: null,
    mostRetreats: null,
    longestCheckSequence: null,
    longestCaptureSpree: null,
    earliestCastling: null,
    mostObscureOpening: null,
    biggestComeback: null,
    luckyEscape: null
  }

  rounds.forEach(round => {
    const roundNum = round.roundNumber

    // Cleanest game (lowest combined ACPL)
    if (round.analysis?.summary?.lowestCombinedACPL) {
      const game = round.analysis.summary.lowestCombinedACPL
      if (!hallOfFame.cleanestGame || game.combinedACPL < hallOfFame.cleanestGame.combinedACPL) {
        hallOfFame.cleanestGame = { round: roundNum, ...game }
      }
    }

    // Wildest game (highest combined ACPL)
    if (round.analysis?.summary?.highestCombinedACPL) {
      const game = round.analysis.summary.highestCombinedACPL
      if (!hallOfFame.wildestGame || game.combinedACPL > hallOfFame.wildestGame.combinedACPL) {
        hallOfFame.wildestGame = { round: roundNum, ...game }
      }
    }

    // Biggest blunder
    if (round.analysis?.summary?.biggestBlunder) {
      const blunder = round.analysis.summary.biggestBlunder
      if (!hallOfFame.biggestBlunder || blunder.cpLoss > hallOfFame.biggestBlunder.cpLoss) {
        hallOfFame.biggestBlunder = { round: roundNum, ...blunder }
      }
    }

    // Most accurate performance (Accuracy King)
    if (round.analysis?.summary?.accuracyKing) {
      const perf = round.analysis.summary.accuracyKing
      if (!hallOfFame.mostAccurate || perf.accuracy > hallOfFame.mostAccurate.accuracy) {
        hallOfFame.mostAccurate = { round: roundNum, ...perf }
      }
    }

    // Worst ACPL
    if (round.analysis?.summary?.highestACPL) {
      const perf = round.analysis.summary.highestACPL
      if (!hallOfFame.worstACPL || perf.acpl > hallOfFame.worstACPL.acpl) {
        hallOfFame.worstACPL = { round: roundNum, ...perf }
      }
    }

    // Biggest comeback
    if (round.analysis?.summary?.comebackKing) {
      const comeback = round.analysis.summary.comebackKing
      if (!hallOfFame.biggestComeback || comeback.swing > hallOfFame.biggestComeback.swing) {
        hallOfFame.biggestComeback = { round: roundNum, ...comeback }
      }
    }

    // Lucky escape
    if (round.analysis?.summary?.luckyEscape) {
      const escape = round.analysis.summary.luckyEscape
      if (!hallOfFame.luckyEscape || escape.escapeAmount > hallOfFame.luckyEscape.escapeAmount) {
        hallOfFame.luckyEscape = { round: roundNum, ...escape }
      }
    }

    // Longest game
    if (round.overview?.longestGame) {
      const game = round.overview.longestGame
      if (!hallOfFame.longestGame || game.moves > hallOfFame.longestGame.moves) {
        hallOfFame.longestGame = { round: roundNum, ...game }
      }
    }

    // Shortest game
    if (round.overview?.shortestGame) {
      const game = round.overview.shortestGame
      if (!hallOfFame.shortestGame || game.moves < hallOfFame.shortestGame.moves) {
        hallOfFame.shortestGame = { round: roundNum, ...game }
      }
    }

    // Sportiest queen
    if (round.funStats?.sportyQueen) {
      const queen = round.funStats.sportyQueen
      if (!hallOfFame.sportiestQueen || queen.distance > hallOfFame.sportiestQueen.distance) {
        const SQUARE_SIZE_CM = 5.5
        const SCALING_FACTOR = 18.54
        const DIAGONAL_CORRECTION = 0.82
        hallOfFame.sportiestQueen = {
          round: roundNum,
          ...queen,
          distanceCm: Math.round(queen.distance * DIAGONAL_CORRECTION * SQUARE_SIZE_CM),
          distanceHumanScaleM: Math.round(queen.distance * DIAGONAL_CORRECTION * SQUARE_SIZE_CM * SCALING_FACTOR / 100)
        }
      }
    }

    // Most retreats (Chicken Award)
    if (round.funStats?.chickenAward) {
      const chicken = round.funStats.chickenAward
      if (!hallOfFame.mostRetreats || chicken.retreats > hallOfFame.mostRetreats.retreats) {
        hallOfFame.mostRetreats = { round: roundNum, ...chicken }
      }
    }

    // Longest check sequence
    if (round.funStats?.longestCheckSequence) {
      const checks = round.funStats.longestCheckSequence
      if (!hallOfFame.longestCheckSequence || checks.length > hallOfFame.longestCheckSequence.length) {
        hallOfFame.longestCheckSequence = { round: roundNum, ...checks }
      }
    }

    // Longest capture spree
    if (round.funStats?.longestCaptureSequence) {
      const captures = round.funStats.longestCaptureSequence
      if (!hallOfFame.longestCaptureSpree || captures.length > hallOfFame.longestCaptureSpree.length) {
        hallOfFame.longestCaptureSpree = { round: roundNum, ...captures }
      }
    }

    // Earliest castling
    if (round.funStats?.castlingRace) {
      const castling = round.funStats.castlingRace
      if (!hallOfFame.earliestCastling || castling.moves < hallOfFame.earliestCastling.moves) {
        hallOfFame.earliestCastling = { round: roundNum, ...castling }
      }
    }

    // Most obscure opening
    if (round.funStats?.openingHipster) {
      const opening = round.funStats.openingHipster
      // We can't easily compare obscurity across rounds, so just take first one for now
      if (!hallOfFame.mostObscureOpening) {
        hallOfFame.mostObscureOpening = { round: roundNum, ...opening }
      }
    }
  })

  return hallOfFame
}

module.exports = {
  findHallOfFame
}
