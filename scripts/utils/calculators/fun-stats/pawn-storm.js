/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Pawn Storm Fun Stat
 *
 * Tracks the game with the most pawn moves in the opening phase.
 */

const { analyzeGamePhases } = require('../../game-phases');
const { getPlayerNames } = require('../helpers');

/**
 * Calculate pawn storm (most pawn moves in opening)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Pawn storm stat
 */
function calculatePawnStorm(games) {
  let pawnStorm = { count: 0, gameIndex: null };

  games.forEach((game, idx) => {
    const phases = analyzeGamePhases(game.moveList, game.pgn);

    // Calculate pawn moves in opening phase
    let openingPawnMoves = 0;
    for (let i = 0; i < Math.min(phases.openingEnd, game.moveList.length); i++) {
      if (game.moveList[i].piece === 'p') {
        openingPawnMoves++;
      }
    }

    if (openingPawnMoves > pawnStorm.count) {
      const players = getPlayerNames(game);
      pawnStorm = {
        count: openingPawnMoves,
        gameIndex: idx,
        white: players.white,
        black: players.black
      };
    }
  });

  return pawnStorm.count > 0 ? pawnStorm : null;
}

module.exports = { calculatePawnStorm };
