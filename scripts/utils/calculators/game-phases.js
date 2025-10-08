/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Game Phases Calculator
 *
 * Calculates statistics about opening, middlegame, and endgame phases
 * using Lichess approach for phase detection.
 */

const { analyzeGamePhases, getPhaseStatistics } = require('../game-phases');
const { getPlayerNames, toFullMoves, filterGamesWithMoves } = require('./helpers');

/**
 * Calculate game phase statistics
 * Note: Phase lengths are in half-moves, so we divide by 2 for full moves
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Phase statistics including averages and longest phases
 */
function calculateGamePhases(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  const allPhases = gamesWithMoves.map(g => analyzeGamePhases(g.moveList, g.pgn));
  const phaseStats = getPhaseStatistics(allPhases);

  // Find longest wait until first capture
  let longestWaitTillCapture = { moves: 0, gameIndex: 0 };
  gamesWithMoves.forEach((game, idx) => {
    const firstCaptureIndex = game.moveList.findIndex(move => move.captured);
    const movesBeforeCapture = firstCaptureIndex === -1 ? game.moveList.length : firstCaptureIndex;
    if (movesBeforeCapture > longestWaitTillCapture.moves) {
      longestWaitTillCapture = { moves: movesBeforeCapture, gameIndex: idx };
    }
  });

  return {
    averageOpening: phaseStats.averageOpening / 2,
    averageMiddlegame: phaseStats.averageMiddlegame / 2,
    averageEndgame: phaseStats.averageEndgame / 2,
    longestWaitTillCapture: {
      moves: toFullMoves(longestWaitTillCapture.moves),
      ...getPlayerNames(gamesWithMoves[longestWaitTillCapture.gameIndex]),
      game: `${gamesWithMoves[longestWaitTillCapture.gameIndex].headers.White} vs ${gamesWithMoves[longestWaitTillCapture.gameIndex].headers.Black}`
    },
    longestMiddlegame: {
      moves: toFullMoves(phaseStats.longestMiddlegame.moves),
      ...getPlayerNames(gamesWithMoves[phaseStats.longestMiddlegame.gameIndex]),
      game: `${gamesWithMoves[phaseStats.longestMiddlegame.gameIndex].headers.White} vs ${gamesWithMoves[phaseStats.longestMiddlegame.gameIndex].headers.Black}`
    },
    longestEndgame: {
      moves: toFullMoves(phaseStats.longestEndgame.moves),
      ...getPlayerNames(gamesWithMoves[phaseStats.longestEndgame.gameIndex]),
      game: `${gamesWithMoves[phaseStats.longestEndgame.gameIndex].headers.White} vs ${gamesWithMoves[phaseStats.longestEndgame.gameIndex].headers.Black}`
    }
  };
}

module.exports = { calculateGamePhases };
