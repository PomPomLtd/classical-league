/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Castling Race Fun Stat
 *
 * Tracks who castled first in the round.
 */

const { getPlayerNames } = require('../helpers');

/**
 * Calculate castling race winner
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Castling race stat
 */
function calculateCastlingRace(games) {
  let castlingRace = { moves: Infinity, gameIndex: null, winner: null };

  games.forEach((game, idx) => {
    let whiteCastled = false;
    let blackCastled = false;
    let firstCastleMove = null;
    let firstCastleColor = null;

    game.moveList.forEach((move, moveIdx) => {
      // Track castling for castling race
      if (move.flags && (move.flags.includes('k') || move.flags.includes('q'))) {
        if (move.color === 'w' && !whiteCastled) {
          whiteCastled = true;
          if (firstCastleMove === null) {
            firstCastleMove = Math.ceil((moveIdx + 1) / 2);
            firstCastleColor = 'white';
          }
        } else if (move.color === 'b' && !blackCastled) {
          blackCastled = true;
          if (firstCastleMove === null) {
            firstCastleMove = Math.ceil((moveIdx + 1) / 2);
            firstCastleColor = 'black';
          }
        }
      }
    });

    // Check if both players castled
    if (whiteCastled && blackCastled && firstCastleMove !== null) {
      if (firstCastleMove < castlingRace.moves) {
        const players = getPlayerNames(game);
        castlingRace = {
          moves: firstCastleMove,
          gameIndex: idx,
          winner: firstCastleColor,
          white: players.white,
          black: players.black
        };
      }
    }
  });

  return castlingRace.moves !== Infinity ? castlingRace : null;
}

module.exports = { calculateCastlingRace };
