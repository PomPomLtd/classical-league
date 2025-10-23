/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Overview Stats Utilities
 *
 * Central export for all overview statistics calculators
 */

const { normalizePlayerName, getDisplayName, extractPlayerNames } = require('./player-normalizer')
const { loadRoundData, getAvailableRounds } = require('./data-loader')
const { aggregateTotals } = require('./aggregate-totals')
const { findHallOfFame } = require('./hall-of-fame')
const { trackPlayers } = require('./player-tracker')
const { calculateTrends } = require('./trends')
const { analyzeAwardFrequency } = require('./award-frequency')
const { generateLeaderboards } = require('./leaderboards')

module.exports = {
  // Player normalization
  normalizePlayerName,
  getDisplayName,
  extractPlayerNames,

  // Data loading
  loadRoundData,
  getAvailableRounds,

  // Calculators
  aggregateTotals,
  findHallOfFame,
  trackPlayers,
  calculateTrends,
  analyzeAwardFrequency,
  generateLeaderboards
}
