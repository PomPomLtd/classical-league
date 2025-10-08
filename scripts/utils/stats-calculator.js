/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Stats Calculator Utility
 *
 * Aggregates statistics from multiple parsed chess games.
 * Generates comprehensive stats matching the schema defined in STATS.md
 *
 * @module stats-calculator
 */

const { calculateOverview } = require('./calculators/overview');
const { calculateResults } = require('./calculators/results');
const { calculateGamePhases } = require('./calculators/game-phases');
const { calculateCheckmates } = require('./calculators/checkmates');
const { calculateOpenings } = require('./calculators/openings');
const { calculateTactics } = require('./calculators/tactics');
const { calculatePieceStats } = require('./calculators/pieces');
const { calculateBoardHeatmap } = require('./calculators/heatmap');
const { calculateAwards } = require('./calculators/awards');
const { calculateFunStats } = require('./calculators/fun-stats');

/**
 * Calculate comprehensive statistics from parsed games
 *
 * @param {Array} parsedGames - Array of parsed game objects from pgn-parser
 * @param {number} roundNumber - Round number
 * @param {number} seasonNumber - Season number
 * @param {Object} tacticalPatterns - Optional tactical patterns data from Python analysis
 * @returns {Object} Complete statistics object
 */
function calculateStats(parsedGames, roundNumber, seasonNumber, tacticalPatterns = null) {
  const stats = {
    roundNumber,
    seasonNumber,
    generatedAt: new Date().toISOString(),
    overview: calculateOverview(parsedGames),
    gamePhases: calculateGamePhases(parsedGames),
    results: calculateResults(parsedGames),
    openings: calculateOpenings(parsedGames),
    tactics: calculateTactics(parsedGames),
    pieces: calculatePieceStats(parsedGames),
    checkmates: calculateCheckmates(parsedGames),
    boardHeatmap: calculateBoardHeatmap(parsedGames),
    awards: calculateAwards(parsedGames),
    funStats: calculateFunStats(parsedGames, tacticalPatterns)
  };

  return stats;
}

module.exports = {
  calculateStats,
  calculateFunStats
};
