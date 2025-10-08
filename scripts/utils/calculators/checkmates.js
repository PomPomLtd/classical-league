/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Checkmates Calculator
 *
 * Analyzes checkmate patterns: which pieces delivered mate,
 * and tracks the fastest checkmate in the round.
 */

const { getPlayerNames, filterGamesWithMoves } = require('./helpers');

/**
 * Map chess.js piece codes to full names
 * Note: King is excluded as it cannot deliver checkmate
 */
const PIECE_MAP = {
  'q': 'queen',
  'r': 'rook',
  'b': 'bishop',
  'n': 'knight',
  'p': 'pawn'
};

/**
 * Calculate checkmate statistics
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Checkmate statistics including by piece and fastest mate
 */
function calculateCheckmates(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  const byPiece = { queen: 0, rook: 0, bishop: 0, knight: 0, pawn: 0 };
  let fastestMate = { moves: Infinity, gameIndex: 0 };

  gamesWithMoves.forEach((game, idx) => {
    game.specialMoves.checkmates.forEach(mate => {
      const pieceCode = mate.piece;
      const pieceName = PIECE_MAP[pieceCode];

      if (pieceName && byPiece[pieceName] !== undefined) {
        byPiece[pieceName]++;
      }

      if (mate.moveNumber < fastestMate.moves) {
        const players = getPlayerNames(game);
        fastestMate = {
          moves: mate.moveNumber, // Already in full moves from PGN parser
          gameIndex: idx,
          white: players.white,
          black: players.black,
          winner: mate.color === 'w' ? 'White' : 'Black'
        };
      }
    });
  });

  return {
    byPiece,
    fastest: fastestMate.moves !== Infinity ? fastestMate : null
  };
}

module.exports = { calculateCheckmates };
