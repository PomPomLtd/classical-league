/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Opening Hipster Fun Stat
 *
 * Tracks the most obscure/specific opening name used.
 * Obscurity = name length + bonus for specificity (contains colon).
 */

const { getOpeningName } = require('../../chess-openings');
const { getPlayerNames } = require('../helpers');

/**
 * Calculate opening hipster (most obscure opening)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Opening hipster stat
 */
function calculateOpeningHipster(games) {
  let openingHipster = { gameIndex: null, eco: null, name: null, moves: null, obscurityScore: 0 };

  games.forEach((game, idx) => {
    // Check for opening hipster award (most obscure opening)
    // Get opening for this game (first 6 moves)
    if (game.moveList.length >= 6) {
      const sequence = game.moveList.slice(0, 6).map(m => m.san).join(' ');
      const opening = getOpeningName(sequence);

      if (opening && opening.name) {
        // Calculate obscurity score: length of name + specificity (has colon = more specific)
        const hasColon = opening.name.includes(':');
        const nameLength = opening.name.length;
        const obscurityScore = nameLength + (hasColon ? 20 : 0);

        if (obscurityScore > openingHipster.obscurityScore) {
          const players = getPlayerNames(game);
          openingHipster = {
            gameIndex: idx,
            eco: opening.eco,
            name: opening.name,
            moves: sequence,
            obscurityScore,
            white: players.white,
            black: players.black
          };
        }
      }
    }
  });

  return openingHipster.gameIndex !== null ? openingHipster : null;
}

module.exports = { calculateOpeningHipster };
