/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Tactics Calculator
 *
 * Analyzes tactical elements: captures, castling, promotions,
 * en passant, underpromotions, and capture streaks.
 */

const { getPlayerNames, filterGamesWithMoves } = require('./helpers');

/**
 * Calculate tactical statistics
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Tactical statistics including captures, castling, promotions
 */
function calculateTactics(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  let totalCaptures = 0;
  let totalPromotions = 0;
  let totalCastlingKingside = 0;
  let totalCastlingQueenside = 0;
  let totalUnderpromotions = 0;

  const enPassantGames = [];
  const underpromotions = [];

  let bloodiestGame = { captures: 0, gameIndex: 0 };
  let quietestGame = { captures: Infinity, gameIndex: 0 };
  let longestNonCaptureStreak = { moves: 0, gameIndex: 0 };

  gamesWithMoves.forEach((game, idx) => {
    const sm = game.specialMoves;
    const players = getPlayerNames(game);

    totalCaptures += sm.totalCaptures;
    totalPromotions += sm.totalPromotions;
    totalCastlingKingside += sm.totalCastlingKingside;
    totalCastlingQueenside += sm.totalCastlingQueenside;

    if (sm.totalEnPassant > 0) {
      enPassantGames.push({ ...players, count: sm.totalEnPassant });
    }

    // Track underpromotions
    game.moveList.forEach((move, moveIdx) => {
      if (move.promotion && move.promotion !== 'q') {
        totalUnderpromotions++;
        underpromotions.push({
          gameIndex: idx,
          moveNumber: Math.floor(moveIdx / 2) + 1,
          promotedTo: move.promotion,
          color: move.color,
          san: move.san,
          ...players
        });
      }
    });

    if (sm.totalCaptures > bloodiestGame.captures) {
      bloodiestGame = { captures: sm.totalCaptures, gameIndex: idx, ...players };
    }

    if (sm.totalCaptures < quietestGame.captures) {
      quietestGame = { captures: sm.totalCaptures, gameIndex: idx, ...players };
    }

    // Find longest non-capture streak
    let currentStreak = 0;
    let maxStreak = 0;
    game.moveList.forEach(move => {
      if (move.captured) {
        currentStreak = 0;
      } else {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      }
    });

    if (maxStreak > longestNonCaptureStreak.moves) {
      longestNonCaptureStreak = { moves: maxStreak, gameIndex: idx, ...players };
    }
  });

  return {
    totalCaptures,
    enPassantGames,
    promotions: totalPromotions,
    castling: {
      kingside: totalCastlingKingside,
      queenside: totalCastlingQueenside
    },
    bloodiestGame,
    quietestGame,
    longestNonCaptureStreak,
    totalUnderpromotions,
    underpromotions
  };
}

module.exports = { calculateTactics };
