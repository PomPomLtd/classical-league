/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Overview Statistics Calculator
 *
 * Calculates basic game overview stats: total games, total moves,
 * average game length, longest/shortest games.
 */

const { getPlayerNames, toFullMoves } = require('./helpers');

/**
 * Calculate overview statistics
 * Note: chess.js history.length gives us half-moves (plies), so we divide by 2 for full moves
 * Note: Games with 0 moves (forfeits with no play) are excluded from move statistics
 *
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Overview statistics
 */
function calculateOverview(games) {
  // Filter out games with no moves for statistics that require moves
  const gamesWithMoves = games.filter(g => g.moves > 0);

  const totalMoves = gamesWithMoves.reduce((sum, g) => sum + g.moves, 0);

  const longestGame = gamesWithMoves.reduce((longest, game, idx) => {
    return game.moves > longest.moves ? { moves: game.moves, gameIndex: idx, game } : longest;
  }, { moves: 0, gameIndex: 0, game: null });

  const shortestGame = gamesWithMoves.reduce((shortest, game, idx) => {
    return game.moves < shortest.moves ? { moves: game.moves, gameIndex: idx, game } : shortest;
  }, { moves: Infinity, gameIndex: 0, game: null });

  const longestPlayers = getPlayerNames(longestGame.game);
  const shortestPlayers = getPlayerNames(shortestGame.game);

  return {
    totalGames: games.length, // Count all games including forfeits
    totalMoves,
    averageGameLength: gamesWithMoves.length > 0 ? totalMoves / gamesWithMoves.length / 2 : 0, // Divide by 2 for full moves
    longestGame: {
      moves: toFullMoves(longestGame.moves),
      white: longestPlayers.white,
      black: longestPlayers.black,
      result: longestGame.game.result
    },
    shortestGame: {
      moves: toFullMoves(shortestGame.moves),
      white: shortestPlayers.white,
      black: shortestPlayers.black,
      result: shortestGame.game.result
    }
  };
}

module.exports = { calculateOverview };
