#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Round Detection Script
 *
 * Detects which round should be analyzed based on:
 * - Active season
 * - Current date vs round dates
 * - Verified game counts
 * - Completion thresholds
 *
 * Usage:
 *   node scripts/detect-current-round.js
 *   node scripts/detect-current-round.js --season 2
 *
 * Outputs JSON to stdout:
 * {
 *   "roundId": "clxxx",
 *   "roundNumber": 1,
 *   "seasonNumber": 2,
 *   "gameCount": 15,
 *   "expectedGames": 25,
 *   "isComplete": false,
 *   "shouldAnalyze": true
 * }
 *
 * @module detect-current-round
 */

const { PrismaClient } = require('@prisma/client');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    season: null, // If null, use active season
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--season' || args[i] === '-s') {
      options.season = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      options.help = true;
    }
  }

  return options;
}

// Display help
function showHelp() {
  console.log(`
Round Detection Script

Detects which round should be analyzed for the current season.

Usage:
  node scripts/detect-current-round.js [options]

Options:
  --season, -s <number>   Specific season number (default: active season)
  --help, -h              Show this help message

Examples:
  node scripts/detect-current-round.js
  node scripts/detect-current-round.js --season 2

Output:
  JSON object with round detection information
`);
}

/**
 * Detect which round should be analyzed
 */
async function detectCurrentRound() {
  const prisma = new PrismaClient();

  try {
    const options = parseArgs();

    if (options.help) {
      showHelp();
      process.exit(0);
    }

    // Get season
    let season;
    if (options.season) {
      season = await prisma.season.findFirst({
        where: { seasonNumber: options.season },
        include: {
          rounds: {
            include: {
              gameResults: {
                where: { isVerified: true },
                select: { id: true },
              },
            },
            orderBy: { roundNumber: 'asc' },
          },
        },
      });

      if (!season) {
        throw new Error(`Season ${options.season} not found`);
      }
    } else {
      // Get active season
      season = await prisma.season.findFirst({
        where: { isActive: true },
        include: {
          rounds: {
            include: {
              gameResults: {
                where: { isVerified: true },
                select: { id: true },
              },
            },
            orderBy: { roundNumber: 'asc' },
          },
        },
      });

      if (!season) {
        throw new Error('No active season found');
      }
    }

    const now = new Date();
    const EXPECTED_GAMES = 25; // Expected games per round (~50 players / 2)
    const COMPLETION_THRESHOLD = 0.8; // 80% completion = 20+ games

    // Find current/incomplete round
    for (const round of season.rounds) {
      const gameCount = round.gameResults.length;
      const roundStart = new Date(round.roundDate);
      const roundEnd = new Date(roundStart);
      roundEnd.setDate(roundEnd.getDate() + 14); // Rounds are 14 days apart

      // Check if round is active (started but not ended)
      const isActive = now >= roundStart && now < roundEnd;
      const isComplete = gameCount >= EXPECTED_GAMES * COMPLETION_THRESHOLD;

      // If round is active or incomplete, this is the one to analyze
      if (isActive || !isComplete) {
        const result = {
          roundId: round.id,
          roundNumber: round.roundNumber,
          seasonNumber: season.seasonNumber,
          gameCount: gameCount,
          expectedGames: EXPECTED_GAMES,
          isComplete: isComplete,
          shouldAnalyze: true,
          roundDate: round.roundDate.toISOString(),
          status: isActive ? 'active' : 'incomplete'
        };

        console.log(JSON.stringify(result, null, 2));
        return;
      }
    }

    // All rounds complete, analyze latest round
    if (season.rounds.length > 0) {
      const latestRound = season.rounds[season.rounds.length - 1];
      const result = {
        roundId: latestRound.id,
        roundNumber: latestRound.roundNumber,
        seasonNumber: season.seasonNumber,
        gameCount: latestRound.gameResults.length,
        expectedGames: EXPECTED_GAMES,
        isComplete: true,
        shouldAnalyze: false,
        roundDate: latestRound.roundDate.toISOString(),
        status: 'complete'
      };

      console.log(JSON.stringify(result, null, 2));
    } else {
      throw new Error('No rounds found for season');
    }

  } catch (error) {
    console.error(JSON.stringify({
      error: error.message,
      shouldAnalyze: false
    }));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
detectCurrentRound();
