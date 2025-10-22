/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Chicken Award Fun Stat
 *
 * Tracks the player with the most retreating moves (moving pieces backward toward own side).
 * White retreats: moving to a lower rank (closer to rank 1)
 * Black retreats: moving to a higher rank (closer to rank 8)
 */

const { getPlayerNames } = require('../helpers');

/**
 * Calculate chicken award (most retreating moves)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Chicken award stat
 */
function calculateChickenAward(games) {
  let chickenAward = { retreats: 0, gameIndex: null, color: null };

  games.forEach((game, idx) => {
    let whiteRetreats = 0;
    let blackRetreats = 0;

    game.moveList.forEach((move) => {
      // Skip castling moves (special case, not a retreat)
      if (move.flags && (move.flags.includes('k') || move.flags.includes('q'))) {
        return;
      }

      const fromRank = parseInt(move.from[1]);
      const toRank = parseInt(move.to[1]);

      // White retreats: moving to a lower rank (closer to rank 1)
      if (move.color === 'w' && toRank < fromRank) {
        whiteRetreats++;
      }
      // Black retreats: moving to a higher rank (closer to rank 8)
      else if (move.color === 'b' && toRank > fromRank) {
        blackRetreats++;
      }
    });

    // Check if this game has the most retreats
    const players = getPlayerNames(game);
    if (whiteRetreats > chickenAward.retreats) {
      chickenAward = {
        retreats: whiteRetreats,
        gameIndex: idx,
        color: 'White',
        white: players.white,
        black: players.black
      };
    }

    if (blackRetreats > chickenAward.retreats) {
      chickenAward = {
        retreats: blackRetreats,
        gameIndex: idx,
        color: 'Black',
        white: players.white,
        black: players.black
      };
    }
  });

  return chickenAward.retreats > 0 ? chickenAward : null;
}

module.exports = { calculateChickenAward };
