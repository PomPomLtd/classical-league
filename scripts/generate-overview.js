#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generate Season Overview Statistics
 *
 * Aggregates all round stats into a comprehensive season overview.
 *
 * Usage:
 *   node scripts/generate-overview.js --season 2
 *
 * Output:
 *   public/stats/season-2-overview.json
 */

const fs = require('fs')
const path = require('path')
const {
  loadRoundData,
  aggregateTotals,
  findHallOfFame,
  trackPlayers,
  calculateTrends,
  analyzeAwardFrequency,
  generateLeaderboards
} = require('./utils/overview')

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2)
  let seasonNumber = 2 // Default to season 2

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--season' && i + 1 < args.length) {
      seasonNumber = parseInt(args[i + 1], 10)
    }
  }

  return { seasonNumber }
}

/**
 * Main function
 */
async function main() {
  console.log('🏆 Generating Season Overview Statistics\n')

  const { seasonNumber } = parseArgs()
  console.log(`Season: ${seasonNumber}\n`)

  try {
    // 1. Load all round data
    console.log('📥 Loading round data...')
    const rounds = loadRoundData(seasonNumber)

    // 2. Calculate various stats
    console.log('\n📊 Calculating statistics...')

    console.log('  - Aggregating totals...')
    const aggregates = aggregateTotals(rounds)

    console.log('  - Finding Hall of Fame...')
    const hallOfFame = findHallOfFame(rounds)

    console.log('  - Tracking players...')
    const playerStats = trackPlayers(rounds)
    const playerCount = Object.keys(playerStats).length
    console.log(`    ✓ Tracked ${playerCount} unique players`)

    console.log('  - Calculating trends...')
    const trends = calculateTrends(rounds)

    console.log('  - Analyzing award frequency...')
    const awardFrequency = analyzeAwardFrequency(rounds)

    console.log('  - Generating leaderboards...')
    const leaderboards = generateLeaderboards(playerStats)

    // 3. Combine into overview object
    const overview = {
      seasonNumber,
      generatedAt: new Date().toISOString(),
      roundsIncluded: rounds.map(r => r.roundNumber),
      aggregates,
      hallOfFame,
      playerStats,
      leaderboards,
      trends,
      awardFrequency: {
        frequency: awardFrequency.frequency,
        mostCommon: awardFrequency.mostCommon,
        leastCommon: awardFrequency.leastCommon,
        sortedByFrequency: awardFrequency.sortedByFrequency
      }
    }

    // 4. Write to file
    const outputPath = path.join(
      process.cwd(),
      'public',
      'stats',
      `season-${seasonNumber}-overview.json`
    )

    fs.writeFileSync(outputPath, JSON.stringify(overview, null, 2))

    console.log('\n✅ Overview statistics generated successfully!')
    console.log(`📁 Output: ${outputPath}`)
    console.log(`\n📈 Summary:`)
    console.log(`  - Rounds: ${overview.roundsIncluded.length}`)
    console.log(`  - Total Games: ${aggregates.totalGames}`)
    console.log(`  - Total Moves: ${aggregates.totalMoves.toLocaleString()}`)
    console.log(`  - Players Tracked: ${playerCount}`)
    console.log(`  - Hall of Fame Entries: ${Object.values(hallOfFame).filter(v => v !== null).length}`)
    console.log(`  - Awards Analyzed: ${awardFrequency.sortedByFrequency.length}`)
    console.log(`\n⚰️ Piece Cemetery: ${aggregates.piecesCaptured.total} total casualties`)
    console.log(`   ♟️ ${aggregates.piecesCaptured.pawns} Pawns • ♞ ${aggregates.piecesCaptured.knights} Knights • ♝ ${aggregates.piecesCaptured.bishops} Bishops • ♜ ${aggregates.piecesCaptured.rooks} Rooks • ♛ ${aggregates.piecesCaptured.queens} Queens\n`)

  } catch (error) {
    console.error('\n❌ Error generating overview:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { main }
