/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Slowest Castling Fun Stat
 *
 * Tracks who castled the latest in the round (highest move number).
 */

const { getPlayerNames } = require('../helpers');

/**
 * Calculate slowest castling (latest castling move)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Slowest castling stat
 */
function calculateSlowestCastling(games) {
  let slowestCastling = { moves: 0, gameIndex: null, color: null };

  games.forEach((game, idx) => {
    game.moveList.forEach((move, moveIdx) => {
      // Check if this is a castling move
      if (move.flags && (move.flags.includes('k') || move.flags.includes('q'))) {
        const moveNumber = Math.ceil((moveIdx + 1) / 2); // Full move number

        if (moveNumber > slowestCastling.moves) {
          const players = getPlayerNames(game);
          slowestCastling = {
            moves: moveNumber,
            gameIndex: idx,
            color: move.color === 'w' ? 'white' : 'black',
            white: players.white,
            black: players.black
          };
        }
      }
    });
  });

  return slowestCastling.moves > 0 ? slowestCastling : null;
}

module.exports = { calculateSlowestCastling };
