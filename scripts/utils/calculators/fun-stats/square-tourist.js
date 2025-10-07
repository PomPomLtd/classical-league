/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Square Tourist Fun Stat
 *
 * Tracks the piece that visited the most unique squares.
 */

const { getPlayerNames, PIECE_NAMES } = require('../helpers');

/**
 * Calculate square tourist (piece visiting most squares)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Square tourist stat
 */
function calculateSquareTourist(games) {
  let squareTourist = { squares: 0, gameIndex: null, piece: null };

  games.forEach((game, idx) => {
    const piecePositions = {}; // { 'w_r_a1': Set(['a1', 'a2', ...]), ... }

    game.moveList.forEach((move) => {
      // Track piece positions for tourist award
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

      // If no existing key, create new one with current 'from' square as start
      if (!pieceKey) {
        pieceKey = `${move.color}_${move.piece}_${move.from}`;
        piecePositions[pieceKey] = new Set();
      }

      piecePositions[pieceKey].add(move.from);
      piecePositions[pieceKey].add(move.to);
    });

    // Calculate square tourist (piece that visited most squares)
    Object.entries(piecePositions).forEach(([pieceKey, positions]) => {
      const uniqueSquares = positions.size;
      if (uniqueSquares > squareTourist.squares) {
        const [color, piece, startSquare] = pieceKey.split('_');
        const colorName = color === 'w' ? 'White' : 'Black';
        const players = getPlayerNames(game);
        squareTourist = {
          squares: uniqueSquares,
          gameIndex: idx,
          piece: PIECE_NAMES[piece] || piece,
          color: colorName,
          startSquare: startSquare,
          white: players.white,
          black: players.black
        };
      }
    });
  });

  return squareTourist.squares > 0 ? squareTourist : null;
}

module.exports = { calculateSquareTourist };
