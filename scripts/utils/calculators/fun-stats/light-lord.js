/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Light Lord (Light Brigade) Fun Stat
 *
 * Tracks the player with the most captures on light squares.
 * A play on "Charge of the Light Brigade" - charging into battle on the bright squares.
 */

const { getPlayerNames, isLightSquare } = require('../helpers');

/**
 * Calculate light lord (most light square captures)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Light lord stat
 */
function calculateLightLord(games) {
  let lightLord = { captures: 0, gameIndex: null, color: null };

  games.forEach((game, idx) => {
    let whiteLightCaptures = 0;
    let blackLightCaptures = 0;

    game.moveList.forEach((move) => {
      // Track light square captures
      if (move.captured && isLightSquare(move.to)) {
        if (move.color === 'w') {
          whiteLightCaptures++;
        } else {
          blackLightCaptures++;
        }
      }
    });

    // Check if this game has the most light square captures
    const players = getPlayerNames(game);
    if (whiteLightCaptures > lightLord.captures) {
      lightLord = {
        captures: whiteLightCaptures,
        gameIndex: idx,
        color: 'White',
        white: players.white,
        black: players.black
      };
    }

    if (blackLightCaptures > lightLord.captures) {
      lightLord = {
        captures: blackLightCaptures,
        gameIndex: idx,
        color: 'Black',
        white: players.white,
        black: players.black
      };
    }
  });

  return lightLord.captures > 0 ? lightLord : null;
}

module.exports = { calculateLightLord };
