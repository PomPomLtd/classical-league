/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Comfort Zone Champion Fun Stat
 *
 * Tracks the player who used one piece type the most (as % of their non-pawn moves).
 */

const { getPlayerNames } = require('../helpers');

/**
 * Calculate most-used piece type percentage (excluding pawns)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Comfort zone stat
 */
function calculateComfortZone(games) {
  let comfortZoneChampion = { percentage: 0, gameIndex: null, color: null };

  games.forEach((game, idx) => {
    const movesByPieceType = {
      white: { n: 0, b: 0, r: 0, q: 0, k: 0, total: 0 },
      black: { n: 0, b: 0, r: 0, q: 0, k: 0, total: 0 }
    };

    game.moveList.forEach((move) => {
      // Skip pawn moves
      if (move.piece === 'p') return;

      const color = move.color === 'w' ? 'white' : 'black';
      movesByPieceType[color][move.piece]++;
      movesByPieceType[color].total++;
    });

    const players = getPlayerNames(game);

    // Check white's most-used piece type
    if (movesByPieceType.white.total > 0) {
      const whiteMostUsed = Object.entries(movesByPieceType.white)
        .filter(([piece]) => piece !== 'total')
        .reduce((max, [piece, count]) => count > max.count ? { piece, count } : max, { piece: null, count: 0 });

      const whitePercentage = Math.round((whiteMostUsed.count / movesByPieceType.white.total) * 100);

      if (whitePercentage > comfortZoneChampion.percentage) {
        comfortZoneChampion = {
          percentage: whitePercentage,
          pieceType: getPieceName(whiteMostUsed.piece),
          moves: whiteMostUsed.count,
          totalNonPawnMoves: movesByPieceType.white.total,
          gameIndex: idx,
          gameId: game.gameId || null,
          color: 'white',
          white: players.white,
          black: players.black
        };
      }
    }

    // Check black's most-used piece type
    if (movesByPieceType.black.total > 0) {
      const blackMostUsed = Object.entries(movesByPieceType.black)
        .filter(([piece]) => piece !== 'total')
        .reduce((max, [piece, count]) => count > max.count ? { piece, count } : max, { piece: null, count: 0 });

      const blackPercentage = Math.round((blackMostUsed.count / movesByPieceType.black.total) * 100);

      if (blackPercentage > comfortZoneChampion.percentage) {
        comfortZoneChampion = {
          percentage: blackPercentage,
          pieceType: getPieceName(blackMostUsed.piece),
          moves: blackMostUsed.count,
          totalNonPawnMoves: movesByPieceType.black.total,
          gameIndex: idx,
          gameId: game.gameId || null,
          color: 'black',
          white: players.white,
          black: players.black
        };
      }
    }
  });

  return comfortZoneChampion.percentage > 0 ? comfortZoneChampion : null;
}

function getPieceName(piece) {
  const names = {
    'n': 'knights',
    'b': 'bishops',
    'r': 'rooks',
    'q': 'queen',
    'k': 'king'
  };
  return names[piece] || piece;
}

module.exports = { calculateComfortZone };
