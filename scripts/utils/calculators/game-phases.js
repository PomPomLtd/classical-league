/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Game Phases Calculator
 *
 * Calculates statistics about opening, middlegame, and endgame phases
 * using Lichess approach for phase detection.
 */

const { analyzeGamePhases, getPhaseStatistics } = require('../game-phases');
const { getPlayerNames, toFullMoves } = require('./helpers');

/**
 * Calculate game phase statistics
 * Note: Phase lengths are in half-moves, so we divide by 2 for full moves
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Phase statistics including averages and longest phases
 */
function calculateGamePhases(games) {
  const allPhases = games.map(g => analyzeGamePhases(g.moveList, g.pgn));
  const phaseStats = getPhaseStatistics(allPhases);

  return {
    averageOpening: phaseStats.averageOpening / 2,
    averageMiddlegame: phaseStats.averageMiddlegame / 2,
    averageEndgame: phaseStats.averageEndgame / 2,
    longestOpening: {
      moves: toFullMoves(phaseStats.longestOpening.moves),
      ...getPlayerNames(games[phaseStats.longestOpening.gameIndex]),
      game: `${games[phaseStats.longestOpening.gameIndex].headers.White} vs ${games[phaseStats.longestOpening.gameIndex].headers.Black}`
    },
    longestMiddlegame: {
      moves: toFullMoves(phaseStats.longestMiddlegame.moves),
      ...getPlayerNames(games[phaseStats.longestMiddlegame.gameIndex]),
      game: `${games[phaseStats.longestMiddlegame.gameIndex].headers.White} vs ${games[phaseStats.longestMiddlegame.gameIndex].headers.Black}`
    },
    longestEndgame: {
      moves: toFullMoves(phaseStats.longestEndgame.moves),
      ...getPlayerNames(games[phaseStats.longestEndgame.gameIndex]),
      game: `${games[phaseStats.longestEndgame.gameIndex].headers.White} vs ${games[phaseStats.longestEndgame.gameIndex].headers.Black}`
    }
  };
}

module.exports = { calculateGamePhases };
