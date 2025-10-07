/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Edge Lord (Professional Edger) Fun Stat
 *
 * Tracks the player with the most moves on edge files (a/h).
 */

const { getPlayerNames } = require('../helpers');

/**
 * Calculate edge lord (most edge file moves)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Edge lord stat
 */
function calculateEdgeLord(games) {
  let edgeLord = { moves: 0, gameIndex: null, color: null };

  games.forEach((game, idx) => {
    let whiteEdgeMoves = 0;
    let blackEdgeMoves = 0;

    game.moveList.forEach((move) => {
      // Track edge moves (a/h files)
      const toFile = move.to[0];
      const fromFile = move.from[0];
      if (toFile === 'a' || toFile === 'h' || fromFile === 'a' || fromFile === 'h') {
        if (move.color === 'w') {
          whiteEdgeMoves++;
        } else {
          blackEdgeMoves++;
        }
      }
    });

    // Check if this game has the most edge moves
    const players = getPlayerNames(game);
    if (whiteEdgeMoves > edgeLord.moves) {
      edgeLord = {
        moves: whiteEdgeMoves,
        gameIndex: idx,
        color: 'White',
        white: players.white,
        black: players.black
      };
    }

    if (blackEdgeMoves > edgeLord.moves) {
      edgeLord = {
        moves: blackEdgeMoves,
        gameIndex: idx,
        color: 'Black',
        white: players.white,
        black: players.black
      };
    }
  });

  return edgeLord.moves > 0 ? edgeLord : null;
}

module.exports = { calculateEdgeLord };
