/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Rook Lift Fun Stat
 *
 * Tracks the earliest rook lift in the tournament
 * (first time a rook leaves its back rank).
 */

const { getPlayerNames } = require('../helpers');

/**
 * Calculate rook lift (earliest rook leaving back rank)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Rook lift stat
 */
function calculateRookLift(games) {
  let rookLift = { moveNumber: Infinity, gameIndex: null, color: null, rook: null };

  games.forEach((game, idx) => {
    // Track rook lifts (first time rook leaves back rank)
    const whiteRookLifted = { a1: false, h1: false };
    const blackRookLifted = { a8: false, h8: false };
    let firstRookLift = null;

    game.moveList.forEach((move, moveIdx) => {
      // Track rook lifts (first time rook leaves back rank)
      if (move.piece === 'r') {
        const fromRank = move.from[1];
        const toRank = move.to[1];

        // White rooks leaving rank 1
        if (move.color === 'w' && fromRank === '1' && toRank !== '1') {
          const startSquare = move.from;
          if (!whiteRookLifted[startSquare] && firstRookLift === null) {
            whiteRookLifted[startSquare] = true;
            const players = getPlayerNames(game);
            firstRookLift = {
              moveNumber: Math.ceil((moveIdx + 1) / 2),
              gameIndex: idx,
              color: 'White',
              rook: `White's ${startSquare} Rook`,
              square: startSquare,
              white: players.white,
              black: players.black
            };
          }
        }

        // Black rooks leaving rank 8
        if (move.color === 'b' && fromRank === '8' && toRank !== '8') {
          const startSquare = move.from;
          if (!blackRookLifted[startSquare] && firstRookLift === null) {
            blackRookLifted[startSquare] = true;
            const players = getPlayerNames(game);
            firstRookLift = {
              moveNumber: Math.ceil((moveIdx + 1) / 2),
              gameIndex: idx,
              color: 'Black',
              rook: `Black's ${startSquare} Rook`,
              square: startSquare,
              white: players.white,
              black: players.black
            };
          }
        }
      }
    });

    // Update rook lift (earliest rook lift in the tournament)
    if (firstRookLift !== null && firstRookLift.moveNumber < rookLift.moveNumber) {
      rookLift = firstRookLift;
    }
  });

  return rookLift.moveNumber !== Infinity ? rookLift : null;
}

module.exports = { calculateRookLift };
