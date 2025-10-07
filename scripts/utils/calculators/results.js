/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Results Calculator
 *
 * Calculates win/loss/draw statistics and percentages.
 */

/**
 * Calculate win/loss/draw statistics
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Results statistics with counts and percentages
 */
function calculateResults(games) {
  let whiteWins = 0;
  let blackWins = 0;
  let draws = 0;

  games.forEach(game => {
    const result = game.result;
    if (result === '1-0') whiteWins++;
    else if (result === '0-1') blackWins++;
    else if (result === '1/2-1/2') draws++;
  });

  const total = games.length;

  return {
    whiteWins,
    blackWins,
    draws,
    whiteWinPercentage: (whiteWins / total) * 100,
    blackWinPercentage: (blackWins / total) * 100,
    drawPercentage: (draws / total) * 100
  };
}

module.exports = { calculateResults };
