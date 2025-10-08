/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Pieces Calculator
 *
 * Analyzes piece statistics: activity (moves made by each piece type),
 * captures (pieces taken), and survival rates.
 */

const { PIECE_NAMES_LOWERCASE, filterGamesWithMoves } = require('./helpers');

/**
 * Calculate piece statistics
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Piece statistics including activity, captures, and survival rates
 */
function calculatePieceStats(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  const activity = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  const captured = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  const survival = { rooks: [], queens: [], bishops: [], knights: [] };

  gamesWithMoves.forEach(game => {
    // Activity
    game.moveList.forEach(move => {
      activity[move.piece]++;
      if (move.captured) {
        captured[move.captured]++;
      }
    });

    // Survival
    const pc = game.piecesRemaining;
    survival.rooks.push(pc.w_r + pc.b_r);
    survival.queens.push(pc.w_q + pc.b_q);
    survival.bishops.push(pc.w_b + pc.b_b);
    survival.knights.push(pc.w_n + pc.b_n);
  });

  const formattedActivity = {};
  Object.entries(activity).forEach(([piece, count]) => {
    formattedActivity[PIECE_NAMES_LOWERCASE[piece]] = count;
  });

  const formattedCaptured = {};
  Object.entries(captured).forEach(([piece, count]) => {
    formattedCaptured[PIECE_NAMES_LOWERCASE[piece]] = count;
  });

  return {
    activity: formattedActivity,
    captured: formattedCaptured,
    survivalRate: {
      rooks: survival.rooks.reduce((a, b) => a + b, 0) / survival.rooks.length / 4,
      queens: survival.queens.reduce((a, b) => a + b, 0) / survival.queens.length / 2,
      bishops: survival.bishops.reduce((a, b) => a + b, 0) / survival.bishops.length / 4,
      knights: survival.knights.reduce((a, b) => a + b, 0) / survival.knights.length / 4
    }
  };
}

module.exports = { calculatePieceStats };
