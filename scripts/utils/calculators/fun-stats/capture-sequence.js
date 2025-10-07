/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Capture Sequence Fun Stat
 *
 * Tracks the longest consecutive capture sequence in any game.
 */

const { getPlayerNames } = require('../helpers');

/**
 * Calculate longest capture sequence
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Longest capture sequence stat
 */
function calculateCaptureSequence(games) {
  let longestCaptureSequence = { length: 0, gameIndex: null, startMove: 0 };

  games.forEach((game, idx) => {
    let currentCaptureSequence = 0;
    let maxCaptureSequence = 0;
    let captureSequenceStart = 0;
    let tempCaptureStart = 0;

    game.moveList.forEach((move, moveIdx) => {
      // Capture sequence detection
      if (move.captured) {
        if (currentCaptureSequence === 0) {
          tempCaptureStart = moveIdx;
        }
        currentCaptureSequence++;
        if (currentCaptureSequence > maxCaptureSequence) {
          maxCaptureSequence = currentCaptureSequence;
          captureSequenceStart = tempCaptureStart;
        }
      } else {
        currentCaptureSequence = 0;
      }
    });

    // Update longest capture sequence across all games
    if (maxCaptureSequence > longestCaptureSequence.length) {
      const players = getPlayerNames(game);
      longestCaptureSequence = {
        length: maxCaptureSequence,
        gameIndex: idx,
        startMove: Math.floor(captureSequenceStart / 2) + 1, // Full move number
        white: players.white,
        black: players.black
      };
    }
  });

  return longestCaptureSequence.length > 0 ? longestCaptureSequence : null;
}

module.exports = { calculateCaptureSequence };
