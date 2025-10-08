/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Shared Helper Functions for Stats Calculators
 *
 * Common utilities used across multiple stat calculators
 * to maintain DRY principles and consistency.
 */

/**
 * Filter out games with no moves (forfeits with no play)
 * These games are still counted in totals but excluded from move-based analysis
 * @param {Array} games - Array of parsed game objects
 * @returns {Array} Games with at least one move
 */
function filterGamesWithMoves(games) {
  return games.filter(g => g.moves > 0);
}

/**
 * Calculate Manhattan distance between two squares on a chess board
 * @param {string} from - Starting square (e.g., 'e2')
 * @param {string} to - Ending square (e.g., 'e4')
 * @returns {number} Manhattan distance
 */
function calculateDistance(from, to) {
  const fromFile = from.charCodeAt(0) - 'a'.charCodeAt(0);
  const fromRank = parseInt(from[1]) - 1;
  const toFile = to.charCodeAt(0) - 'a'.charCodeAt(0);
  const toRank = parseInt(to[1]) - 1;
  return Math.abs(toFile - fromFile) + Math.abs(toRank - fromRank);
}

/**
 * Check if a square is a dark square
 * @param {string} square - Square notation (e.g., 'd4')
 * @returns {boolean} True if dark square
 */
function isDarkSquare(square) {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
  const rank = parseInt(square[1]) - 1; // 0-7
  return (file + rank) % 2 === 1; // Dark squares have odd sum
}

/**
 * Get player name from game headers
 * @param {Object} game - Game object with headers
 * @param {string} color - 'white' or 'black'
 * @returns {string} Player name
 */
function getPlayerName(game, color) {
  return color === 'white'
    ? (game.headers.White || 'Unknown')
    : (game.headers.Black || 'Unknown');
}

/**
 * Get both player names from game headers
 * @param {Object} game - Game object with headers
 * @returns {Object} Object with white and black player names
 */
function getPlayerNames(game) {
  return {
    white: game.headers.White || 'Unknown',
    black: game.headers.Black || 'Unknown'
  };
}

/**
 * Convert half-moves (plies) to full moves
 * @param {number} halfMoves - Number of half-moves
 * @returns {number} Number of full moves (rounded up)
 */
function toFullMoves(halfMoves) {
  return Math.ceil(halfMoves / 2);
}

/**
 * Piece type names mapping
 */
const PIECE_NAMES = {
  p: 'Pawn',
  n: 'Knight',
  b: 'Bishop',
  r: 'Rook',
  q: 'Queen',
  k: 'King'
};

/**
 * Piece type names mapping (lowercase for tactical stats)
 */
const PIECE_NAMES_LOWERCASE = {
  p: 'pawns',
  n: 'knights',
  b: 'bishops',
  r: 'rooks',
  q: 'queens',
  k: 'kings'
};

/**
 * Center squares set
 */
const CENTER_SQUARES = new Set(['d4', 'd5', 'e4', 'e5']);

module.exports = {
  filterGamesWithMoves,
  calculateDistance,
  isDarkSquare,
  getPlayerName,
  getPlayerNames,
  toFullMoves,
  PIECE_NAMES,
  PIECE_NAMES_LOWERCASE,
  CENTER_SQUARES
};
