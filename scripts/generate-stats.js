#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Stats Generation Script
 *
 * Generates comprehensive chess statistics from PGN data.
 *
 * Usage:
 *   node scripts/generate-stats.js --round 1
 *   node scripts/generate-stats.js --round 2 --season 2
 *
 * @module generate-stats
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { parseMultipleGames } = require('./utils/pgn-parser');
const { calculateStats } = require('./utils/stats-calculator');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    round: null,
    season: 2, // Default to Season 2
    analyze: false, // Stockfish analysis flag
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--round' || args[i] === '-r') {
      options.round = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--season' || args[i] === '-s') {
      options.season = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--analyze' || args[i] === '-a') {
      options.analyze = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      options.help = true;
    }
  }

  return options;
}

// Display help
function showHelp() {
  console.log(`
Chess Statistics Generator

Usage:
  node scripts/generate-stats.js --round <number> [--season <number>] [--analyze]

Options:
  --round, -r <number>   Round number to generate stats for (required)
  --season, -s <number>  Season number (default: 2)
  --analyze, -a          Run Stockfish analysis (requires venv and stockfish)
  --help, -h             Show this help message

Examples:
  node scripts/generate-stats.js --round 1
  node scripts/generate-stats.js --round 1 --analyze
  node scripts/generate-stats.js --round 2 --season 2 --analyze

Output:
  Generates JSON file at: public/stats/season-<season>-round-<round>.json
  Updates overall stats: public/stats/season-<season>-overall.json

Note:
  --analyze runs Stockfish engine analysis to calculate accuracy, ACPL,
  and move quality. Requires Python venv and stockfish binary installed.
  Analysis takes ~5-10 minutes for 20 games.
  `);
}

// Fetch PGN data from stdin or file
async function fetchPGN(roundNumber, seasonNumber) {
  console.log(`📥 Fetching PGN data for Season ${seasonNumber}, Round ${roundNumber}...`);

  // Check if data is being piped via stdin
  if (!process.stdin.isTTY) {
    // Read from stdin
    let pgnData = '';
    for await (const chunk of process.stdin) {
      pgnData += chunk;
    }
    console.log(`✅ PGN data loaded (${pgnData.length} bytes)`);
    return pgnData;
  }

  // Otherwise, try to read from the test file
  const testFile = '/tmp/round1-fresh.pgn';

  if (!fs.existsSync(testFile)) {
    throw new Error(`PGN file not found: ${testFile}\nPlease download PGN data or pipe via stdin.`);
  }

  const pgnData = fs.readFileSync(testFile, 'utf-8');
  console.log(`✅ PGN data loaded (${pgnData.length} bytes)`);

  return pgnData;
}

// Run tactical analysis on parsed games (pins, forks, skewers)
function analyzeTactics(parsedGames) {
  const startTime = Date.now();

  try {
    // Extract normalized PGN from parsed games
    const normalizedPgn = parsedGames.map(g => g.pgn).join('\n\n');

    console.log('🎯 Running tactical analysis (pins, forks, skewers)...');

    // Run Python tactical analyzer
    const tacticsOutput = execSync(
      'venv/bin/python scripts/analyze-tactics.py',
      {
        input: normalizedPgn,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        cwd: path.join(__dirname, '..'),
        stdio: ['pipe', 'pipe', 'inherit'] // stdin: pipe, stdout: pipe, stderr: inherit (show progress)
      }
    );

    const tacticsData = JSON.parse(tacticsOutput);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✅ Tactical analysis complete in ${elapsed}s`);

    return tacticsData;

  } catch (error) {
    console.error('❌ Tactical analysis failed:', error.message);
    if (error.stderr) {
      console.error('Error output:', error.stderr);
    }
    throw error;
  }
}

// Run Stockfish analysis on parsed games
function analyzeGames(parsedGames) {
  const startTime = Date.now();

  try {
    // Extract normalized PGN from parsed games
    const normalizedPgn = parsedGames.map(g => g.pgn).join('\n\n');

    console.log('\n🔬 Running Stockfish analysis (accuracy, blunders)...');

    // Run Python analyzer (depth 15, analyze all moves for maximum accuracy)
    const analysisOutput = execSync(
      'venv/bin/python scripts/analyze-pgn.py --depth 15 --sample 1',
      {
        input: normalizedPgn,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        cwd: path.join(__dirname, '..'),
        stdio: ['pipe', 'pipe', 'inherit'] // stdin: pipe, stdout: pipe, stderr: inherit (show progress)
      }
    );

    const analysisData = JSON.parse(analysisOutput);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✅ Stockfish analysis complete in ${elapsed}s`);
    console.log(`📊 Games analyzed: ${analysisData.games.length}`);

    if (analysisData.summary.accuracyKing) {
      const king = analysisData.summary.accuracyKing;
      const playerName = king.player === 'white' ? king.white : king.black;
      console.log(`👑 Accuracy King: ${playerName} (${king.accuracy}% accuracy, ${king.acpl} ACPL)`);
    }

    return analysisData;

  } catch (error) {
    console.error('❌ Stockfish analysis failed:', error.message);
    if (error.stderr) {
      console.error('Error output:', error.stderr);
    }
    throw error;
  }
}

// Main execution
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (!options.round) {
    console.error('❌ Error: --round parameter is required\n');
    showHelp();
    process.exit(1);
  }

  console.log('🎯 K4 Classical League - Stats Generator\n');
  console.log(`Season: ${options.season}`);
  console.log(`Round: ${options.round}\n`);

  const startTime = Date.now();

  try {
    // Step 1: Fetch PGN data
    const pgnData = await fetchPGN(options.round, options.season);

    // Step 2: Parse PGN
    console.log('🔍 Parsing PGN data...');
    const parseResults = parseMultipleGames(pgnData);

    console.log(`✅ Parsed ${parseResults.validCount}/${parseResults.totalGames} games successfully`);

    if (parseResults.errorCount > 0) {
      console.warn(`⚠️  ${parseResults.errorCount} games failed to parse`);
      parseResults.errors.forEach(err => {
        console.warn(`   Game ${err.gameIndex + 1}: Parse error`);
      });
    }

    // Step 3: Run tactical analysis (always - it's fast!)
    console.log('');
    const tacticsData = analyzeTactics(parseResults.valid);

    // Step 4: Run Stockfish analysis (optional - slow!)
    let analysisData = null;
    if (options.analyze) {
      analysisData = analyzeGames(parseResults.valid);
    }

    // Step 5: Calculate statistics (pass tactical data for awards)
    console.log('\n📊 Calculating statistics...');
    const stats = calculateStats(parseResults.valid, options.round, options.season, tacticsData);

    // Step 6: Merge tactical and analysis data into stats
    if (tacticsData) {
      stats.tacticalPatterns = tacticsData;
      console.log('✅ Tactical data merged into stats');
    }
    if (analysisData) {
      stats.analysis = analysisData;
      console.log('✅ Stockfish analysis data merged into stats');
    }

    // Step 7: Save to JSON file
    const outputDir = path.join(__dirname, '../public/stats');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, `season-${options.season}-round-${options.round}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(stats, null, 2));

    const fileSize = (fs.statSync(outputFile).size / 1024).toFixed(2);
    console.log(`✅ Stats saved to: ${outputFile}`);
    console.log(`📦 File size: ${fileSize} KB`);

    // Step 5: Display summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  Completed in ${duration}s\n`);

    console.log('📈 Statistics Summary:');
    console.log(`   Games: ${stats.overview.totalGames}`);
    console.log(`   Total Moves: ${stats.overview.totalMoves}`);
    console.log(`   Avg Game Length: ${stats.overview.averageGameLength.toFixed(1)} moves`);
    console.log(`   White Wins: ${stats.results.whiteWins} (${stats.results.whiteWinPercentage.toFixed(1)}%)`);
    console.log(`   Black Wins: ${stats.results.blackWins} (${stats.results.blackWinPercentage.toFixed(1)}%)`);
    console.log(`   Draws: ${stats.results.draws} (${stats.results.drawPercentage.toFixed(1)}%)`);
    console.log(`   Total Captures: ${stats.tactics.totalCaptures}`);
    console.log(`   En Passant Games: ${stats.tactics.enPassantGames.length}`);
    console.log(`   Promotions: ${stats.tactics.promotions}`);

    console.log('\n🏆 Awards:');
    console.log(`   🩸 Bloodbath: ${stats.awards.bloodbath.white} vs ${stats.awards.bloodbath.black} (${stats.awards.bloodbath.captures} captures)`);
    console.log(`   🕊️  Pacifist: ${stats.awards.pacifist.white} vs ${stats.awards.pacifist.black} (${stats.awards.pacifist.captures} captures)`);
    if (stats.awards.speedDemon) {
      console.log(`   ⚡ Speed Demon: ${stats.awards.speedDemon.white} vs ${stats.awards.speedDemon.black} (mate in ${stats.awards.speedDemon.moves} moves)`);
    }
    console.log(`   🧙 Endgame Wizard: ${stats.awards.endgameWizard.white} vs ${stats.awards.endgameWizard.black} (${stats.awards.endgameWizard.endgameMoves} moves)`);

    console.log('\n🗺️  Board Heatmap:');
    console.log(`   🩸 Bloodiest Square: ${stats.boardHeatmap.bloodiestSquare.square} (${stats.boardHeatmap.bloodiestSquare.captures} captures)`);
    console.log(`   🔥 Most Popular: ${stats.boardHeatmap.mostPopularSquare.square} (${stats.boardHeatmap.mostPopularSquare.visits} visits)`);
    console.log(`   🏜️  Least Popular: ${stats.boardHeatmap.leastPopularSquare.square} (${stats.boardHeatmap.leastPopularSquare.visits} visits)`);
    if (stats.boardHeatmap.quietestSquares.length > 0) {
      console.log(`   😴 Never Visited: ${stats.boardHeatmap.quietestSquares.join(', ')}`);
    } else {
      console.log(`   ✨ All squares saw action!`);
    }

    if (tacticsData && tacticsData.summary) {
      console.log('\n🐔 Chicken Awards:');
      if (tacticsData.summary.homebody) {
        const h = tacticsData.summary.homebody;
        const name = h.player === 'white' ? h.white : h.black;
        console.log(`   🏠 Homeboy: ${name} (${h.piecesInEnemy} pieces in enemy territory)`);
      }
      if (tacticsData.summary.lateBloomer) {
        const lb = tacticsData.summary.lateBloomer;
        const name = lb.player === 'white' ? lb.white : lb.black;
        console.log(`   🐢 Late Bloomer: ${name} (first invasion move ${Math.floor((lb.moveNumber + 1) / 2)})`);
      }
      if (tacticsData.summary.quickDraw) {
        const qd = tacticsData.summary.quickDraw;
        const name = qd.player === 'white' ? qd.white : qd.black;
        console.log(`   🔫 Fastest Gun: ${name} (first invasion move ${Math.floor((qd.moveNumber + 1) / 2)})`);
      }
    }

    console.log('\n✅ Done! Stats are ready to use.\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error generating stats:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, parseArgs, fetchPGN };
