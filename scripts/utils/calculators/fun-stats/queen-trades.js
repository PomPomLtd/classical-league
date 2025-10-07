/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Queen Trades Fun Stat
 *
 * Tracks the fastest and slowest queen trades in the round.
 * A queen trade occurs when both queens are captured.
 */

const { getPlayerNames } = require('../helpers');

/**
 * Calculate fastest and slowest queen trades
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Queen trade statistics
 */
function calculateQueenTrades(games) {
  let fastestQueenTrade = { moves: Infinity, gameIndex: null };
  let slowestQueenTrade = { moves: 0, gameIndex: null };

  games.forEach((game, idx) => {
    let whiteQueenCaptured = false;
    let blackQueenCaptured = false;
    let queenTradeMoveNumber = null;

    game.moveList.forEach((move, moveIdx) => {
      // Check if queen was captured
      if (move.captured === 'q') {
        if (move.color === 'w') {
          // White captured black's queen
          blackQueenCaptured = true;
        } else {
          // Black captured white's queen
          whiteQueenCaptured = true;
        }

        // If both queens are gone, record the move number
        if (whiteQueenCaptured && blackQueenCaptured && queenTradeMoveNumber === null) {
          queenTradeMoveNumber = Math.floor(moveIdx / 2) + 1; // Full move number
        }
      }
    });

    // Update fastest/slowest queen trades
    if (queenTradeMoveNumber !== null) {
      if (queenTradeMoveNumber < fastestQueenTrade.moves) {
        const players = getPlayerNames(game);
        fastestQueenTrade = {
          moves: queenTradeMoveNumber,
          gameIndex: idx,
          white: players.white,
          black: players.black
        };
      }

      if (queenTradeMoveNumber > slowestQueenTrade.moves) {
        const players = getPlayerNames(game);
        slowestQueenTrade = {
          moves: queenTradeMoveNumber,
          gameIndex: idx,
          white: players.white,
          black: players.black
        };
      }
    }
  });

  return {
    fastest: fastestQueenTrade.moves !== Infinity ? fastestQueenTrade : null,
    slowest: slowestQueenTrade.moves > 0 ? slowestQueenTrade : null
  };
}

module.exports = { calculateQueenTrades };
