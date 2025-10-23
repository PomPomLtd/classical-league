 
/**
 * Award Frequency Analyzer
 *
 * Analyzes which awards appear most/least frequently across rounds
 * (Fun "stat stats")
 */

/**
 * List of all possible fun stat awards
 */
const ALL_FUN_STAT_AWARDS = [
  'fastestQueenTrade',
  'slowestQueenTrade',
  'longestCaptureSequence',
  'longestCheckSequence',
  'pawnStorm',
  'pieceLoyalty',
  'squareTourist',
  'castlingRace',
  'openingHipster',
  'dadbodShuffler',
  'sportyQueen',
  'edgeLord',
  'rookLift',
  'centerStage',
  'darkLord',
  'chickenAward',
  'homebody',
  'lateBloomer',
  'quickDraw',
  'crosshairs',
  'longestTension'
]

/**
 * Human-readable award names
 */
const AWARD_DISPLAY_NAMES = {
  fastestQueenTrade: 'Fastest Queen Trade',
  slowestQueenTrade: 'Slowest Queen Trade',
  longestCaptureSequence: 'Longest Capture Spree',
  longestCheckSequence: 'Longest King Hunt',
  pawnStorm: 'Pawn Storm',
  pieceLoyalty: 'Piece Loyalty',
  squareTourist: 'Square Tourist',
  castlingRace: 'Castling Race',
  openingHipster: 'Opening Hipster',
  dadbodShuffler: 'Dadbod Shuffler',
  sportyQueen: 'Sporty Queen',
  edgeLord: 'Professional Edger',
  rookLift: 'Rook Lift',
  centerStage: 'Center Stage',
  darkLord: 'Dark Mode Enthusiast',
  chickenAward: 'Chicken Award',
  homebody: 'Homeboy',
  lateBloomer: 'Late Bloomer',
  quickDraw: 'Fastest Gun',
  crosshairs: 'Crosshairs',
  longestTension: 'Hypertension Award'
}

/**
 * Analyze award frequency across rounds
 * @param {Array<Object>} rounds - Array of round data
 * @returns {Object} Award frequency statistics
 */
function analyzeAwardFrequency(rounds) {
  const frequency = {}
  const totalRounds = rounds.length

  // Initialize all awards
  ALL_FUN_STAT_AWARDS.forEach(award => {
    frequency[award] = {
      displayName: AWARD_DISPLAY_NAMES[award] || award,
      appearances: 0,
      percentage: 0
    }
  })

  // Count appearances
  rounds.forEach(round => {
    if (round.funStats) {
      Object.keys(round.funStats).forEach(awardKey => {
        if (round.funStats[awardKey] !== null && round.funStats[awardKey] !== undefined) {
          if (frequency[awardKey]) {
            frequency[awardKey].appearances++
          }
        }
      })
    }
  })

  // Calculate percentages
  Object.keys(frequency).forEach(award => {
    frequency[award].percentage = totalRounds > 0
      ? Math.round((frequency[award].appearances / totalRounds) * 100 * 10) / 10
      : 0
  })

  // Find most and least common awards
  let mostCommon = null
  let leastCommon = null
  let maxAppearances = 0
  let minAppearances = Infinity

  Object.entries(frequency).forEach(([key, data]) => {
    if (data.appearances > maxAppearances) {
      maxAppearances = data.appearances
      mostCommon = { key, ...data }
    }
    if (data.appearances > 0 && data.appearances < minAppearances) {
      minAppearances = data.appearances
      leastCommon = { key, ...data }
    }
  })

  // Sort by frequency (descending)
  const sortedByFrequency = Object.entries(frequency)
    .map(([key, data]) => ({ key, ...data }))
    .sort((a, b) => b.appearances - a.appearances)

  return {
    frequency,
    mostCommon,
    leastCommon,
    sortedByFrequency,
    totalRounds
  }
}

module.exports = {
  analyzeAwardFrequency
}
