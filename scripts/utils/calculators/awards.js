/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Awards Calculator
 *
 * Calculates tournament awards: Bloodbath, Pacifist, Speed Demon,
 * Endgame Wizard, and Opening Sprinter.
 */

const { analyzeGamePhases } = require('../game-phases');
const { getPlayerNames, toFullMoves, filterGamesWithMoves } = require('./helpers');
const { calculateTactics } = require('./tactics');
const { calculateCheckmates } = require('./checkmates');

/**
 * Calculate tournament awards
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Award statistics
 */
function calculateAwards(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  const tactics = calculateTactics(games);
  const checkmates = calculateCheckmates(games);
  const phases = gamesWithMoves.map(g => analyzeGamePhases(g.moveList, g.pgn));

  const longestEndgame = phases.reduce((longest, phase, idx) => {
    return phase.endgame > longest.moves ? { moves: phase.endgame, gameIndex: idx } : longest;
  }, { moves: 0, gameIndex: 0 });

  const shortestOpening = phases.reduce((shortest, phase, idx) => {
    if (phase.opening === 0) return shortest;
    return phase.opening < shortest.moves ? { moves: phase.opening, gameIndex: idx } : shortest;
  }, { moves: Infinity, gameIndex: 0 });

  return {
    bloodbath: {
      white: tactics.bloodiestGame.white,
      black: tactics.bloodiestGame.black,
      captures: tactics.bloodiestGame.captures
    },
    pacifist: {
      white: tactics.quietestGame.white,
      black: tactics.quietestGame.black,
      captures: tactics.quietestGame.captures
    },
    speedDemon: checkmates.fastest ? {
      white: checkmates.fastest.white,
      black: checkmates.fastest.black,
      moves: checkmates.fastest.moves,
      winner: checkmates.fastest.winner
    } : null,
    endgameWizard: {
      ...getPlayerNames(gamesWithMoves[longestEndgame.gameIndex]),
      endgameMoves: toFullMoves(longestEndgame.moves)
    },
    openingSprinter: shortestOpening.moves !== Infinity ? {
      ...getPlayerNames(gamesWithMoves[shortestOpening.gameIndex]),
      openingMoves: toFullMoves(shortestOpening.moves)
    } : null
  };
}

module.exports = { calculateAwards };
