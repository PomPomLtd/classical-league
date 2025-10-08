/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Openings Calculator
 *
 * Analyzes opening moves and sequences, identifying ECO codes
 * and tracking first move popularity and win rates.
 */

const { getOpeningName } = require('../chess-openings');
const { filterGamesWithMoves } = require('./helpers');

/**
 * Calculate opening statistics
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Opening statistics with first moves and popular sequences
 */
function calculateOpenings(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  const firstMoves = {};
  const openingSequences = {};

  gamesWithMoves.forEach(game => {
    if (game.moveList.length > 0) {
      // First move
      const firstMove = game.moveList[0].san;
      if (!firstMoves[firstMove]) {
        firstMoves[firstMove] = { count: 0, wins: 0, draws: 0, losses: 0 };
      }
      firstMoves[firstMove].count++;

      // Track results for this opening
      if (game.result === '1-0') firstMoves[firstMove].wins++;
      else if (game.result === '1/2-1/2') firstMoves[firstMove].draws++;
      else if (game.result === '0-1') firstMoves[firstMove].losses++;

      // Opening sequence (first 6 moves = 3 moves each side)
      if (game.moveList.length >= 6) {
        const sequence = game.moveList.slice(0, 6).map(m => m.san).join(' ');
        openingSequences[sequence] = (openingSequences[sequence] || 0) + 1;
      }
    }
  });

  // Format first moves with percentages and win rates
  const formattedFirstMoves = {};
  const total = gamesWithMoves.length;
  Object.entries(firstMoves).forEach(([move, data]) => {
    formattedFirstMoves[move] = {
      count: data.count,
      percentage: (data.count / total) * 100,
      winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0
    };
  });

  // Get popular sequences with opening names, sorted by popularity then ECO code
  const popularSequences = Object.entries(openingSequences)
    .map(([moves, count]) => {
      const opening = getOpeningName(moves);
      return {
        moves,
        count,
        eco: opening?.eco || null,
        name: opening?.name || null
      };
    })
    .sort((a, b) => {
      // First sort by count (popularity, descending)
      if (a.count !== b.count) return b.count - a.count;

      // Then sort by ECO code alphabetically (nulls last)
      if (a.eco && b.eco) return a.eco.localeCompare(b.eco);
      if (a.eco) return -1;
      if (b.eco) return 1;
      return 0;
    });

  return {
    firstMoves: formattedFirstMoves,
    popularSequences
  };
}

module.exports = { calculateOpenings };
