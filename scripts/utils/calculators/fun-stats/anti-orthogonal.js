/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Anti-Orthogonal Activist Fun Stat
 *
 * Tracks the player with the most diagonal moves (bishops and queens moving diagonally).
 */

const { getPlayerNames } = require('../helpers');

/**
 * Calculate most diagonal moves
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Most diagonal moves stat
 */
function calculateAntiOrthogonal(games) {
  let mostDiagonal = { moves: 0, gameIndex: null, color: null };

  games.forEach((game, idx) => {
    const diagonalMovesByColor = { white: 0, black: 0 };

    game.moveList.forEach((move) => {
      // Check if this is a diagonal move (bishop or queen)
      if (move.piece === 'b' || move.piece === 'q') {
        // Diagonal moves: from and to squares differ by same amount in rank and file
        const fromFile = move.from.charCodeAt(0);
        const fromRank = parseInt(move.from[1]);
        const toFile = move.to.charCodeAt(0);
        const toRank = parseInt(move.to[1]);

        const fileDiff = Math.abs(toFile - fromFile);
        const rankDiff = Math.abs(toRank - fromRank);

        // If file and rank differences are equal and non-zero, it's a diagonal move
        if (fileDiff === rankDiff && fileDiff > 0) {
          if (move.color === 'w') {
            diagonalMovesByColor.white++;
          } else {
            diagonalMovesByColor.black++;
          }
        }
      }
    });

    // Check which color had more diagonal moves
    const players = getPlayerNames(game);

    if (diagonalMovesByColor.white > mostDiagonal.moves) {
      mostDiagonal = {
        moves: diagonalMovesByColor.white,
        gameIndex: idx,
        gameId: game.gameId || null,
        color: 'white',
        white: players.white,
        black: players.black
      };
    }

    if (diagonalMovesByColor.black > mostDiagonal.moves) {
      mostDiagonal = {
        moves: diagonalMovesByColor.black,
        gameIndex: idx,
        gameId: game.gameId || null,
        color: 'black',
        white: players.white,
        black: players.black
      };
    }
  });

  return mostDiagonal.moves > 0 ? mostDiagonal : null;
}

module.exports = { calculateAntiOrthogonal };
