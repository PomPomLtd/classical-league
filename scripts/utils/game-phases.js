/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Game Phase Detection Utility
 *
 * Detects opening, middlegame, and endgame phases in chess games.
 * Based on Lichess's implementation with simplified heuristics.
 *
 * Phase definitions (inspired by Lichess's Divider.scala):
 * - Opening: Game start until pieces are developed (both castled OR move 20 OR piece count ≤ 10)
 * - Middlegame: From opening end until endgame starts
 * - Endgame: When 6 or fewer minor/major pieces remain (queens, rooks, bishops, knights)
 *
 * @module game-phases
 */

const { Chess } = require('chess.js');

/**
 * Analyze game phases for a parsed game
 *
 * @param {Array} history - Move history from chess.js (verbose format)
 * @param {string} pgn - Original PGN string for replay
 * @returns {Object} Phase analysis with move numbers and lengths
 */
function analyzeGamePhases(history, pgn) {
  if (history.length === 0) {
    return {
      opening: 0,
      middlegame: 0,
      endgame: 0,
      openingEnd: 0,
      middlegameEnd: 0
    };
  }

  const chess = new Chess();
  chess.loadPgn(pgn);

  // Detect opening end (middlegame start)
  const openingEnd = detectOpeningEnd(history, pgn);

  // Detect endgame start
  const endgameStart = detectEndgameStart(history, pgn);

  // Calculate phase lengths
  const openingLength = openingEnd;
  const middlegameLength = endgameStart - openingEnd;
  const endgameLength = history.length - endgameStart;

  return {
    opening: openingLength,
    middlegame: middlegameLength,
    endgame: endgameLength,
    openingEnd,
    middlegameEnd: endgameStart
  };
}

/**
 * Detect when the opening phase ends (middlegame starts)
 *
 * Based on Lichess's approach with simplified heuristics:
 * - Both sides have castled, OR
 * - Move 20 reached, OR
 * - Piece count drops to 10 or fewer minor/major pieces
 *
 * @param {Array} history - Move history
 * @param {string} pgn - Original PGN for position replay
 * @returns {number} Move number when opening ends
 */
function detectOpeningEnd(history, pgn) {
  let whiteCastled = false;
  let blackCastled = false;

  for (let i = 0; i < history.length; i++) {
    const move = history[i];

    // Check for castling
    if (move.color === 'w' && (move.flags.includes('k') || move.flags.includes('q'))) {
      whiteCastled = true;
    }
    if (move.color === 'b' && (move.flags.includes('k') || move.flags.includes('q'))) {
      blackCastled = true;
    }

    // Replay to current position and check piece count
    const tempChess = new Chess();
    for (let j = 0; j <= i; j++) {
      tempChess.move(history[j].san);
    }
    const pieceCount = countMinorMajorPieces(tempChess.board());

    // Opening ends when: both castled OR move 20 OR piece count ≤ 10
    if ((whiteCastled && blackCastled) || i >= 20 || pieceCount <= 10) {
      return i;
    }
  }

  // Default: opening ends around move 15
  return Math.min(15, history.length);
}

/**
 * Detect when the endgame phase starts
 *
 * Based on Lichess's threshold:
 * - 6 or fewer minor/major pieces remain (queens, rooks, bishops, knights)
 * - Pawns and kings are excluded from count
 *
 * @param {Array} history - Move history
 * @param {string} pgn - Original PGN for position replay
 * @returns {number} Move number when endgame starts
 */
function detectEndgameStart(history, pgn) {
  const chess = new Chess();

  // Work backwards from end to find when endgame started
  for (let i = history.length - 1; i >= 0; i--) {
    // Reset and replay to this position
    chess.reset();
    chess.loadPgn(pgn);

    // Remove moves after position i
    const tempChess = new Chess();
    for (let j = 0; j <= i; j++) {
      tempChess.move(history[j].san);
    }

    const pieceCount = countMinorMajorPieces(tempChess.board());

    // Endgame threshold: 6 or fewer minor/major pieces (Lichess standard)
    if (pieceCount <= 6) {
      // Continue searching backwards
      continue;
    } else {
      // Found where endgame started (next move after this)
      return i + 1;
    }
  }

  // If we never found endgame, it starts at the end
  return history.length;
}

/**
 * Count minor and major pieces (excluding pawns and kings)
 *
 * @param {Array} board - Chess.js board array
 * @returns {number} Count of minor/major pieces
 */
function countMinorMajorPieces(board) {
  let count = 0;

  board.forEach(row => {
    row.forEach(square => {
      if (square && square.type !== 'k' && square.type !== 'p') {
        count++;
      }
    });
  });

  return count;
}

/**
 * Determine which phase a specific move number is in
 *
 * @param {number} moveNumber - The move number to check
 * @param {Object} phases - Phase analysis object
 * @returns {string} Phase name: 'opening', 'middlegame', or 'endgame'
 */
function getMovePhase(moveNumber, phases) {
  if (moveNumber < phases.openingEnd) {
    return 'opening';
  } else if (moveNumber < phases.middlegameEnd) {
    return 'middlegame';
  } else {
    return 'endgame';
  }
}

/**
 * Get statistics about phase distribution across multiple games
 *
 * @param {Array} gamesPhases - Array of phase analysis objects
 * @returns {Object} Aggregate phase statistics
 */
function getPhaseStatistics(gamesPhases) {
  if (gamesPhases.length === 0) {
    return {
      averageOpening: 0,
      averageMiddlegame: 0,
      averageEndgame: 0,
      longestOpening: null,
      longestMiddlegame: null,
      longestEndgame: null
    };
  }

  let totalOpening = 0;
  let totalMiddlegame = 0;
  let totalEndgame = 0;

  let longestOpening = { moves: 0, gameIndex: null };
  let longestMiddlegame = { moves: 0, gameIndex: null };
  let longestEndgame = { moves: 0, gameIndex: null };

  gamesPhases.forEach((phases, index) => {
    totalOpening += phases.opening;
    totalMiddlegame += phases.middlegame;
    totalEndgame += phases.endgame;

    if (phases.opening > longestOpening.moves) {
      longestOpening = { moves: phases.opening, gameIndex: index };
    }
    if (phases.middlegame > longestMiddlegame.moves) {
      longestMiddlegame = { moves: phases.middlegame, gameIndex: index };
    }
    if (phases.endgame > longestEndgame.moves) {
      longestEndgame = { moves: phases.endgame, gameIndex: index };
    }
  });

  const count = gamesPhases.length;

  return {
    averageOpening: totalOpening / count,
    averageMiddlegame: totalMiddlegame / count,
    averageEndgame: totalEndgame / count,
    longestOpening,
    longestMiddlegame,
    longestEndgame
  };
}

module.exports = {
  analyzeGamePhases,
  detectOpeningEnd,
  detectEndgameStart,
  getMovePhase,
  getPhaseStatistics,
  countMinorMajorPieces
};
