/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Parkour Master Fun Stat
 *
 * Tracks the player with the most knight moves in a single game.
 * Named "Parkour Master" because knights jump over pieces like parkour athletes!
 */

const { getPlayerNames } = require('../helpers');

/**
 * Calculate parkour master (most knight moves in a game)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Parkour master stat
 */
function calculateParkourMaster(games) {
  let parkourMaster = { knightMoves: 0, gameIndex: null, color: null };

  games.forEach((game, idx) => {
    let whiteKnightMoves = 0;
    let blackKnightMoves = 0;

    game.moveList.forEach((move) => {
      // Track knight moves (piece type is 'n' for knight)
      if (move.piece === 'n') {
        if (move.color === 'w') {
          whiteKnightMoves++;
        } else {
          blackKnightMoves++;
        }
      }
    });

    // Check if this game has the most knight moves
    const players = getPlayerNames(game);
    if (whiteKnightMoves > parkourMaster.knightMoves) {
      parkourMaster = {
        knightMoves: whiteKnightMoves,
        gameIndex: idx,
        color: 'White',
        white: players.white,
        black: players.black
      };
    }

    if (blackKnightMoves > parkourMaster.knightMoves) {
      parkourMaster = {
        knightMoves: blackKnightMoves,
        gameIndex: idx,
        color: 'Black',
        white: players.white,
        black: players.black
      };
    }
  });

  return parkourMaster.knightMoves > 0 ? parkourMaster : null;
}

module.exports = { calculateParkourMaster };
