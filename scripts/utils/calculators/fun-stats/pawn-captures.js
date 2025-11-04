/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Pawn Captures Fun Stat
 *
 * Tracks the game with the most captures made by pawns.
 */

const { getPlayerNames } = require('../helpers');

/**
 * Calculate most pawn captures
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Most pawn captures stat
 */
function calculatePawnCaptures(games) {
  let mostPawnCaptures = { captures: 0, gameIndex: null, color: null };

  games.forEach((game, idx) => {
    const pawnCapturesByColor = { white: 0, black: 0 };

    game.moveList.forEach((move) => {
      // Check if this is a pawn capture
      if (move.piece === 'p' && move.captured) {
        if (move.color === 'w') {
          pawnCapturesByColor.white++;
        } else {
          pawnCapturesByColor.black++;
        }
      }
    });

    // Check which color had more pawn captures
    const players = getPlayerNames(game);

    if (pawnCapturesByColor.white > mostPawnCaptures.captures) {
      mostPawnCaptures = {
        captures: pawnCapturesByColor.white,
        gameIndex: idx,
        color: 'white',
        white: players.white,
        black: players.black
      };
    }

    if (pawnCapturesByColor.black > mostPawnCaptures.captures) {
      mostPawnCaptures = {
        captures: pawnCapturesByColor.black,
        gameIndex: idx,
        color: 'black',
        white: players.white,
        black: players.black
      };
    }
  });

  return mostPawnCaptures.captures > 0 ? mostPawnCaptures : null;
}

module.exports = { calculatePawnCaptures };
