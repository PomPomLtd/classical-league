/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Check Sequence Fun Stat (King Hunt)
 *
 * Tracks the longest series of checks by one side.
 * Opponent moves between checks are allowed.
 */

const { getPlayerNames } = require('../helpers');

/**
 * Calculate longest check sequence
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Longest check sequence stat
 */
function calculateCheckSequence(games) {
  let longestCheckSequence = { length: 0, gameIndex: null, startMove: 0 };

  games.forEach((game, idx) => {
    let currentCheckSequence = 0;
    let maxCheckSequence = 0;
    let checkSequenceStart = 0;
    let tempCheckStart = 0;

    game.moveList.forEach((move, moveIdx) => {
      // King Hunt detection - series of checks by one side (even with opponent moves between)
      if (move.san.includes('+') || move.san.includes('#')) {
        if (currentCheckSequence === 0) {
          // Start new sequence
          tempCheckStart = moveIdx;
          currentCheckSequence = 1;
          checkSequenceStart = tempCheckStart;
        } else {
          // Find the last checking move to see if same color
          let lastCheckingColor = null;
          for (let i = moveIdx - 1; i >= 0; i--) {
            if (game.moveList[i].san.includes('+') || game.moveList[i].san.includes('#')) {
              lastCheckingColor = game.moveList[i].color;
              break;
            }
          }

          if (lastCheckingColor === move.color) {
            // Same side checking again, increment sequence
            currentCheckSequence++;
            if (currentCheckSequence > maxCheckSequence) {
              maxCheckSequence = currentCheckSequence;
              checkSequenceStart = tempCheckStart;
            }
          } else {
            // Different side, start new sequence
            currentCheckSequence = 1;
            tempCheckStart = moveIdx;
          }
        }
      }
      // Don't reset on non-check moves since opponent moves between checks are expected
    });

    // Update longest check sequence across all games
    if (maxCheckSequence > longestCheckSequence.length) {
      const players = getPlayerNames(game);
      longestCheckSequence = {
        length: maxCheckSequence,
        gameIndex: idx,
        startMove: Math.floor(checkSequenceStart / 2) + 1, // Full move number
        white: players.white,
        black: players.black
      };
    }
  });

  return longestCheckSequence.length > 0 ? longestCheckSequence : null;
}

module.exports = { calculateCheckSequence };
