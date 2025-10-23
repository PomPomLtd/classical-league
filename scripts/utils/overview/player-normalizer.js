 
/**
 * Player Name Normalization
 *
 * Matches players across rounds by removing nicknames.
 * Example: "Boris «Out of Nowhere» G." -> "Boris G."
 */

/**
 * Normalize a player name by removing nickname
 * @param {string} fullName - Full player name with optional nickname
 * @returns {string} Normalized name without nickname
 */
function normalizePlayerName(fullName) {
  if (!fullName) return 'Unknown'

  // Remove nickname (text between « and »)
  return fullName.replace(/«[^»]+»\s*/g, '').trim()
}

/**
 * Get display name (use full name with nickname)
 * For now, we use the most recent appearance
 * @param {Array<string>} appearances - Array of full names from different rounds
 * @returns {string} Display name with nickname
 */
function getDisplayName(appearances) {
  if (!appearances || appearances.length === 0) return 'Unknown'

  // Return most recent appearance (last in array)
  return appearances[appearances.length - 1]
}

/**
 * Extract player names from game data
 * @param {Object} game - Game object with white/black properties
 * @returns {Object} { white: normalized, black: normalized, whiteDisplay: full, blackDisplay: full }
 */
function extractPlayerNames(game) {
  const white = game.white || 'Unknown'
  const black = game.black || 'Unknown'

  return {
    white: normalizePlayerName(white),
    black: normalizePlayerName(black),
    whiteDisplay: white,
    blackDisplay: black
  }
}

module.exports = {
  normalizePlayerName,
  getDisplayName,
  extractPlayerNames
}
