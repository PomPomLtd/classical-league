/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Dark Lord (Dark Mode Enthusiast) Fun Stat
 *
 * Tracks the player with the most captures on dark squares.
 */

const { getPlayerNames, isDarkSquare } = require('../helpers');

/**
 * Calculate dark lord (most dark square captures)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Dark lord stat
 */
function calculateDarkLord(games) {
  let darkLord = { captures: 0, gameIndex: null, color: null };

  games.forEach((game, idx) => {
    let whiteDarkCaptures = 0;
    let blackDarkCaptures = 0;

    game.moveList.forEach((move) => {
      // Track dark square captures
      if (move.captured && isDarkSquare(move.to)) {
        if (move.color === 'w') {
          whiteDarkCaptures++;
        } else {
          blackDarkCaptures++;
        }
      }
    });

    // Check if this game has the most dark square captures
    const players = getPlayerNames(game);
    if (whiteDarkCaptures > darkLord.captures) {
      darkLord = {
        captures: whiteDarkCaptures,
        gameIndex: idx,
        color: 'White',
        white: players.white,
        black: players.black
      };
    }

    if (blackDarkCaptures > darkLord.captures) {
      darkLord = {
        captures: blackDarkCaptures,
        gameIndex: idx,
        color: 'Black',
        white: players.white,
        black: players.black
      };
    }
  });

  return darkLord.captures > 0 ? darkLord : null;
}

module.exports = { calculateDarkLord };
