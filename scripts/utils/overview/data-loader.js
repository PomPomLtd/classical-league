/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Data Loader for Overview Stats
 *
 * Loads all available round JSON files for a given season
 */

const fs = require('fs')
const path = require('path')

/**
 * Load all round data for a season
 * @param {number} seasonNumber - Season number (e.g., 2)
 * @returns {Array<Object>} Array of round data objects, sorted by round number
 */
function loadRoundData(seasonNumber) {
  const statsDir = path.join(process.cwd(), 'public', 'stats')
  const rounds = []

  // Try to load rounds 1-7 (Swiss system typically has 7 rounds)
  for (let roundNum = 1; roundNum <= 7; roundNum++) {
    const filePath = path.join(statsDir, `season-${seasonNumber}-round-${roundNum}.json`)

    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        rounds.push(data)
        console.log(`✓ Loaded Round ${roundNum} (${data.overview.totalGames} games)`)
      } catch (error) {
        console.warn(`⚠ Failed to parse Round ${roundNum}:`, error.message)
      }
    } else {
      console.log(`✗ Round ${roundNum} not found, skipping...`)
    }
  }

  if (rounds.length === 0) {
    throw new Error(`No round data found for Season ${seasonNumber}`)
  }

  console.log(`\n📊 Loaded ${rounds.length} rounds for Season ${seasonNumber}`)
  return rounds.sort((a, b) => a.roundNumber - b.roundNumber)
}

/**
 * Get list of available round numbers for a season
 * @param {number} seasonNumber - Season number
 * @returns {Array<number>} Array of round numbers
 */
function getAvailableRounds(seasonNumber) {
  const statsDir = path.join(process.cwd(), 'public', 'stats')
  const available = []

  for (let roundNum = 1; roundNum <= 7; roundNum++) {
    const filePath = path.join(statsDir, `season-${seasonNumber}-round-${roundNum}.json`)
    if (fs.existsSync(filePath)) {
      available.push(roundNum)
    }
  }

  return available
}

module.exports = {
  loadRoundData,
  getAvailableRounds
}
