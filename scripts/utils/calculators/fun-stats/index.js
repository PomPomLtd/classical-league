/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Fun Stats Orchestrator
 *
 * Coordinates all fun stat calculators and returns combined results.
 */

const { calculateQueenTrades } = require('./queen-trades');
const { calculateCaptureSequence } = require('./capture-sequence');
const { calculateCheckSequence } = require('./check-sequence');
const { calculatePawnStorm } = require('./pawn-storm');
const { calculatePieceLoyalty } = require('./piece-loyalty');
const { calculateSquareTourist } = require('./square-tourist');
const { calculateCastlingRace } = require('./castling-race');
const { calculateOpeningHipster } = require('./opening-hipster');
const { calculateDadbodShuffler } = require('./dadbod-shuffler');
const { calculateSportyQueen } = require('./sporty-queen');
const { calculateEdgeLord } = require('./edge-lord');
const { calculateRookLift } = require('./rook-lift');
const { calculateCenterStage } = require('./center-stage');
const { calculateDarkLord } = require('./dark-lord');

/**
 * Calculate all fun statistics
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} All fun statistics
 */
function calculateFunStats(games) {
  const queenTrades = calculateQueenTrades(games);
  const pieceLoyalty = calculatePieceLoyalty(games);

  return {
    fastestQueenTrade: queenTrades?.fastest || null,
    slowestQueenTrade: queenTrades?.slowest || null,
    longestCaptureSequence: calculateCaptureSequence(games),
    longestCheckSequence: calculateCheckSequence(games),
    pawnStorm: calculatePawnStorm(games),
    pieceLoyalty: pieceLoyalty?.moves >= 30 ? pieceLoyalty : null, // Only show if 30+ moves (15 full moves)
    squareTourist: calculateSquareTourist(games),
    castlingRace: calculateCastlingRace(games),
    openingHipster: calculateOpeningHipster(games),
    dadbodShuffler: calculateDadbodShuffler(games),
    sportyQueen: calculateSportyQueen(games),
    edgeLord: calculateEdgeLord(games),
    rookLift: calculateRookLift(games),
    centerStage: calculateCenterStage(games),
    darkLord: calculateDarkLord(games)
  };
}

module.exports = { calculateFunStats };
