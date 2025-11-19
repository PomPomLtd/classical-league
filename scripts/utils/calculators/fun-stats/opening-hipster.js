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
 * Get rarity bonus based on ECO code
 * Exotic openings get higher bonuses
 * @param {string} eco - ECO code (e.g., "B12", "A04")
 * @returns {number} Rarity bonus
 */
function getEcoRarityBonus(eco) {
  if (!eco || eco.length < 3) return 0;

  const letter = eco[0];
  const number = parseInt(eco.substring(1));

  // Very common openings (minimal bonus)
  if (letter === 'B' && number >= 10 && number <= 99) return 0;  // Sicilian + Caro-Kann
  if (letter === 'C' && number >= 40 && number <= 99) return 5;  // Common e4 openings (Italian, Spanish)
  if (letter === 'D' && number >= 0 && number <= 99) return 5;   // Queen's Pawn openings
  if (letter === 'E' && number >= 0 && number <= 99) return 10;  // Indian Defenses

  // Moderately common (medium bonus)
  if (letter === 'C' && number >= 0 && number <= 39) return 20;  // French, some open games
  if (letter === 'A' && number >= 10 && number <= 39) return 25; // English Opening

  // Uncommon (higher bonus)
  if (letter === 'A' && number >= 40 && number <= 79) return 40; // Various d4 systems
  if (letter === 'B' && number >= 0 && number <= 9) return 45;   // Unusual e4 responses (includes B00)

  // Very rare (highest bonus)
  if (letter === 'A' && number >= 80 && number <= 99) return 60; // Dutch Defense
  if (letter === 'A' && number >= 0 && number <= 9) return 70;   // Unusual first moves (Zukertort, etc.)

  return 30; // Default for anything else
}

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
        // Calculate obscurity score with heavy weighting on ECO rarity
        const hasColon = opening.name.includes(':');
        const nameLength = opening.name.length;
        const ecoRarityBonus = getEcoRarityBonus(opening.eco);

        // Score: name length + colon bonus + DOUBLE the ECO rarity bonus
        const obscurityScore = nameLength + (hasColon ? 20 : 0) + (ecoRarityBonus * 2);

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
