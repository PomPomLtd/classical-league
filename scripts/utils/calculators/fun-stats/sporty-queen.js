/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Sporty Queen Fun Stat
 *
 * Tracks the queen that traveled the most distance (Manhattan distance).
 */

const { getPlayerNames, calculateDistance } = require('../helpers');

/**
 * Calculate sporty queen (queen with most travel distance)
 * Uses Manhattan distance for squares, but estimates actual physical distance
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Sporty queen stat
 */
function calculateSportyQueen(games) {
  let sportyQueen = { distance: 0, gameIndex: null, color: null };

  games.forEach((game, idx) => {
    let whiteQueenDistance = 0;
    let blackQueenDistance = 0;

    game.moveList.forEach((move) => {
      // Track queen movement distance for sporty queen
      if (move.piece === 'q') {
        const distance = calculateDistance(move.from, move.to);
        if (move.color === 'w') {
          whiteQueenDistance += distance;
        } else {
          blackQueenDistance += distance;
        }
      }
    });

    // Check if this game has the most active queen
    const players = getPlayerNames(game);
    if (whiteQueenDistance > sportyQueen.distance) {
      sportyQueen = {
        distance: whiteQueenDistance,
        gameIndex: idx,
        color: 'White',
        white: players.white,
        black: players.black
      };
    }

    if (blackQueenDistance > sportyQueen.distance) {
      sportyQueen = {
        distance: blackQueenDistance,
        gameIndex: idx,
        color: 'Black',
        white: players.white,
        black: players.black
      };
    }
  });

  return sportyQueen.distance > 0 ? sportyQueen : null;
}

module.exports = { calculateSportyQueen };
