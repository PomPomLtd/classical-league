/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Center Stage Fun Stat
 *
 * Tracks the piece with the most moves to center squares (d4, d5, e4, e5).
 */

const { getPlayerNames, CENTER_SQUARES, PIECE_NAMES } = require('../helpers');

/**
 * Calculate center stage (piece with most center square activity)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Center stage stat
 */
function calculateCenterStage(games) {
  let centerStage = { moves: 0, gameIndex: null, piece: null, startSquare: null, color: null };

  games.forEach((game, idx) => {
    const pieceCenterActivity = {}; // { 'w_r_a1': { moves: 5, piece: 'r', startSquare: 'a1', color: 'w', lastSquare: 'e4' } }

    game.moveList.forEach((move) => {
      // Track center square activity for all pieces
      if (CENTER_SQUARES.has(move.to)) {
        // Create unique piece key based on first time we see it
        let pieceKey = null;

        // Find existing piece key
        for (const existingKey in pieceCenterActivity) {
          const [existingColor, existingPiece] = existingKey.split('_');
          if (existingColor === move.color && existingPiece === move.piece) {
            // Check if this piece came from a square we've seen
            const existingData = pieceCenterActivity[existingKey];
            if (existingData.lastSquare === move.from) {
              pieceKey = existingKey;
              break;
            }
          }
        }

        // Create new key if needed
        if (!pieceKey) {
          // Find starting square by looking for first occurrence of this piece
          let startSquare = move.from;
          // If this is the first move of this piece, use 'from' as start square
          pieceKey = `${move.color}_${move.piece}_${startSquare}`;
          pieceCenterActivity[pieceKey] = {
            moves: 0,
            piece: move.piece,
            startSquare: startSquare,
            color: move.color,
            lastSquare: move.from
          };
        }

        pieceCenterActivity[pieceKey].moves++;
        pieceCenterActivity[pieceKey].lastSquare = move.to;
      } else {
        // Update lastSquare even when not in center
        for (const key in pieceCenterActivity) {
          const data = pieceCenterActivity[key];
          if (data.lastSquare === move.from && data.color === move.color && data.piece === move.piece) {
            data.lastSquare = move.to;
          }
        }
      }
    });

    // Update center stage (piece with most center square activity)
    Object.entries(pieceCenterActivity).forEach(([, data]) => {
      if (data.moves > centerStage.moves) {
        const colorName = data.color === 'w' ? 'White' : 'Black';
        const players = getPlayerNames(game);
        centerStage = {
          moves: data.moves,
          gameIndex: idx,
          piece: `${colorName}'s ${data.startSquare} ${PIECE_NAMES[data.piece]}`,
          startSquare: data.startSquare,
          color: colorName,
          white: players.white,
          black: players.black
        };
      }
    });
  });

  return centerStage.moves > 0 ? centerStage : null;
}

module.exports = { calculateCenterStage };
