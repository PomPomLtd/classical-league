/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Piece Loyalty Fun Stat
 *
 * Tracks the piece that stayed on its starting square the longest.
 */

const { getPlayerNames, PIECE_NAMES } = require('../helpers');

/**
 * Calculate piece loyalty (piece staying on start square longest)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Piece loyalty stat
 */
function calculatePieceLoyalty(games) {
  let pieceLoyalty = { moves: 0, gameIndex: null, piece: null, square: null };

  games.forEach((game, idx) => {
    const piecePositions = {}; // { 'w_r_a1': Set(['a1', 'a2', ...]), ... }
    const pieceStartSquares = {}; // { 'w_r_a1': 'a1', ... }

    game.moveList.forEach((move) => {
      // Track piece positions
      let pieceKey = null;

      // Find if this piece already has a key
      for (const existingKey in piecePositions) {
        const [existingColor, existingPiece] = existingKey.split('_');
        if (existingColor === move.color && existingPiece === move.piece) {
          const positions = Array.from(piecePositions[existingKey]);
          if (positions.includes(move.from)) {
            pieceKey = existingKey;
            break;
          }
        }
      }

      // Create new key if needed
      if (!pieceKey) {
        pieceKey = `${move.color}_${move.piece}_${move.from}`;
        piecePositions[pieceKey] = new Set();
        pieceStartSquares[pieceKey] = move.from;
      }

      piecePositions[pieceKey].add(move.from);
      piecePositions[pieceKey].add(move.to);
    });

    // Calculate piece loyalty (piece that stayed on starting square longest)
    Object.entries(pieceStartSquares).forEach(([pieceKey, startSquare]) => {
      const positions = Array.from(piecePositions[pieceKey]);
      const firstMove = positions.findIndex(sq => sq !== startSquare);
      const movesOnStart = firstMove === -1 ? game.moveList.length : firstMove;

      if (movesOnStart > pieceLoyalty.moves) {
        const [, piece] = pieceKey.split('_');
        const players = getPlayerNames(game);
        pieceLoyalty = {
          moves: movesOnStart,
          gameIndex: idx,
          piece: PIECE_NAMES[piece] || piece,
          square: startSquare,
          white: players.white,
          black: players.black
        };
      }
    });
  });

  return pieceLoyalty.moves > 0 ? pieceLoyalty : null;
}

module.exports = { calculatePieceLoyalty };
