/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Board Heatmap Calculator
 *
 * Tracks square activity (moves to/from) and captures on each square
 * to identify hotspots and quiet zones on the board.
 */

const { filterGamesWithMoves } = require('./helpers');

/**
 * Calculate board heatmap statistics
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Heatmap statistics with most/least active squares
 */
function calculateBoardHeatmap(games) {
  const gamesWithMoves = filterGamesWithMoves(games);
  const squareActivity = {}; // Total moves to/from each square
  const captureSquares = {}; // Captures on each square

  // Initialize all squares
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

  files.forEach(file => {
    ranks.forEach(rank => {
      const square = file + rank;
      squareActivity[square] = 0;
      captureSquares[square] = 0;
    });
  });

  // Track activity and captures
  gamesWithMoves.forEach(game => {
    game.moveList.forEach(move => {
      // Track destination square activity
      if (move.to) {
        squareActivity[move.to] = (squareActivity[move.to] || 0) + 1;
      }

      // Track captures on squares
      if (move.captured && move.to) {
        captureSquares[move.to] = (captureSquares[move.to] || 0) + 1;
      }
    });
  });

  // Find most/least active squares
  const sortedActivity = Object.entries(squareActivity).sort((a, b) => b[1] - a[1]);
  const sortedCaptures = Object.entries(captureSquares).sort((a, b) => b[1] - a[1]);

  // Get non-zero squares for least popular
  const activeSquares = sortedActivity.filter(([, count]) => count > 0);

  return {
    bloodiestSquare: {
      square: sortedCaptures[0][0],
      captures: sortedCaptures[0][1],
      description: `${sortedCaptures[0][0]} saw ${sortedCaptures[0][1]} captures`
    },
    mostPopularSquare: {
      square: sortedActivity[0][0],
      visits: sortedActivity[0][1],
      description: `${sortedActivity[0][0]} was visited ${sortedActivity[0][1]} times`
    },
    leastPopularSquare: {
      square: activeSquares[activeSquares.length - 1][0],
      visits: activeSquares[activeSquares.length - 1][1],
      description: `${activeSquares[activeSquares.length - 1][0]} was only visited ${activeSquares[activeSquares.length - 1][1]} times`
    },
    quietestSquares: sortedActivity.filter(([, count]) => count === 0).map(([sq]) => sq),
    top5Bloodiest: sortedCaptures.slice(0, 5).map(([sq, count]) => ({ square: sq, captures: count })),
    top5Popular: sortedActivity.slice(0, 5).map(([sq, count]) => ({ square: sq, visits: count }))
  };
}

module.exports = { calculateBoardHeatmap };
