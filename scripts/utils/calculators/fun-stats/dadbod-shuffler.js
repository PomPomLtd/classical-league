/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Dadbod Shuffler Fun Stat
 *
 * Tracks the most active king (most king moves in a game).
 */

const { getPlayerNames } = require('../helpers');

/**
 * Calculate dadbod shuffler (most king moves)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Dadbod shuffler stat
 */
function calculateDadbodShuffler(games) {
  let dadbodShuffler = { moves: 0, gameIndex: null, color: null };

  games.forEach((game, idx) => {
    let whiteKingMoves = 0;
    let blackKingMoves = 0;

    game.moveList.forEach((move) => {
      // Track king moves for dadbod shuffler
      if (move.piece === 'k') {
        if (move.color === 'w') {
          whiteKingMoves++;
        } else {
          blackKingMoves++;
        }
      }
    });

    // Check if this game has the most king moves
    const players = getPlayerNames(game);
    if (whiteKingMoves > dadbodShuffler.moves) {
      dadbodShuffler = {
        moves: whiteKingMoves,
        gameIndex: idx,
        color: 'White',
        white: players.white,
        black: players.black
      };
    }

    if (blackKingMoves > dadbodShuffler.moves) {
      dadbodShuffler = {
        moves: blackKingMoves,
        gameIndex: idx,
        color: 'Black',
        white: players.white,
        black: players.black
      };
    }
  });

  return dadbodShuffler.moves > 0 ? dadbodShuffler : null;
}

module.exports = { calculateDadbodShuffler };
