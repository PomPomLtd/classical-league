/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * PGN Parser Utility
 *
 * Parses PGN (Portable Game Notation) strings into structured game data.
 * Handles both individual games and multi-game PGN files.
 *
 * @module pgn-parser
 */

const { Chess } = require('chess.js');

/**
 * Parse a single PGN string into structured game data
 * 
 * @param {string} pgnString - The PGN notation for a single game
 * @param {number} gameIndex - Index of this game in the collection (for error reporting)
 * @returns {Object|null} Parsed game data or null if parsing fails
 */
function parseSingleGame(pgnString, gameIndex = 0) {
  const chess = new Chess();

  try {
    // Load the PGN into chess.js
    chess.loadPgn(pgnString);

    // Extract headers
    const headers = extractHeaders(pgnString);

    // Get move history with detailed information
    const history = chess.history({ verbose: true });

    // Get final board state
    const board = chess.board();

    // Count pieces remaining
    const piecesRemaining = countPieces(board);

    // Analyze special moves
    const specialMoves = analyzeSpecialMoves(history);

    // Determine result
    const result = headers.Result || determineResult(chess);

    // Generate FEN positions for each move (for Stockfish analysis)
    const positions = generatePositions(pgnString);

    // Generate normalized PGN from chess.js (includes proper formatting with blank line)
    const normalizedPGN = chess.pgn();

    return {
      // Metadata
      headers,
      gameIndex,

      // Move data
      moves: history.length,
      moveList: history,

      // Game outcome
      result,
      isCheckmate: chess.isCheckmate(),
      isDraw: chess.isDraw(),
      isStalemate: chess.isStalemate(),

      // Piece information
      piecesRemaining,

      // Special moves
      specialMoves,

      // Position data for analysis
      positions,

      // Normalized PGN for reference (properly formatted for python-chess)
      pgn: normalizedPGN
    };

  } catch (error) {
    console.warn(`⚠️  Failed to parse game ${gameIndex + 1}: ${error.message}`);
    return null;
  }
}

/**
 * Extract headers from PGN string
 * 
 * @param {string} pgnString - The PGN notation
 * @returns {Object} Extracted headers
 */
function extractHeaders(pgnString) {
  const headers = {};
  const headerRegex = /\[(\w+)\s+"([^"]*)"\]/g;
  let match;
  
  while ((match = headerRegex.exec(pgnString)) !== null) {
    headers[match[1]] = match[2];
  }
  
  return headers;
}

/**
 * Count pieces remaining on the board
 * 
 * @param {Array} board - Chess.js board array
 * @returns {Object} Piece counts
 */
function countPieces(board) {
  const counts = {
    w_p: 0, w_n: 0, w_b: 0, w_r: 0, w_q: 0, w_k: 0,
    b_p: 0, b_n: 0, b_b: 0, b_r: 0, b_q: 0, b_k: 0,
    total: 0
  };
  
  board.forEach(row => {
    row.forEach(square => {
      if (square) {
        const key = `${square.color}_${square.type}`;
        counts[key]++;
        counts.total++;
      }
    });
  });
  
  return counts;
}

/**
 * Analyze special moves in the game
 * 
 * @param {Array} history - Move history from chess.js
 * @returns {Object} Special move analysis
 */
function analyzeSpecialMoves(history) {
  const analysis = {
    captures: [],
    enPassant: [],
    castling: { kingside: [], queenside: [] },
    promotions: [],
    checks: [],
    checkmates: [],
    
    // Counts
    totalCaptures: 0,
    totalEnPassant: 0,
    totalCastlingKingside: 0,
    totalCastlingQueenside: 0,
    totalPromotions: 0,
    totalChecks: 0,
    totalCheckmates: 0
  };
  
  history.forEach((move, index) => {
    // Captures
    if (move.captured) {
      analysis.captures.push({
        moveNumber: Math.floor(index / 2) + 1,
        piece: move.piece,
        captured: move.captured,
        color: move.color,
        san: move.san
      });
      analysis.totalCaptures++;
    }
    
    // En passant
    if (move.flags.includes('e')) {
      analysis.enPassant.push({
        moveNumber: Math.floor(index / 2) + 1,
        color: move.color,
        san: move.san
      });
      analysis.totalEnPassant++;
    }
    
    // Castling
    if (move.flags.includes('k')) {
      analysis.castling.kingside.push({
        moveNumber: Math.floor(index / 2) + 1,
        color: move.color
      });
      analysis.totalCastlingKingside++;
    }
    if (move.flags.includes('q')) {
      analysis.castling.queenside.push({
        moveNumber: Math.floor(index / 2) + 1,
        color: move.color
      });
      analysis.totalCastlingQueenside++;
    }
    
    // Promotions
    if (move.promotion) {
      analysis.promotions.push({
        moveNumber: Math.floor(index / 2) + 1,
        color: move.color,
        promotedTo: move.promotion,
        san: move.san
      });
      analysis.totalPromotions++;
    }
    
    // Checks and checkmates
    if (move.san.includes('+') && !move.san.includes('#')) {
      analysis.checks.push({
        moveNumber: Math.floor(index / 2) + 1,
        piece: move.piece,
        color: move.color,
        san: move.san
      });
      analysis.totalChecks++;
    }
    if (move.san.includes('#')) {
      analysis.checkmates.push({
        moveNumber: Math.floor(index / 2) + 1,
        piece: move.piece,
        color: move.color,
        san: move.san
      });
      analysis.totalCheckmates++;
    }
  });
  
  return analysis;
}

/**
 * Determine game result from chess.js state
 * 
 * @param {Chess} chess - Chess.js instance
 * @returns {string} Result string
 */
function determineResult(chess) {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? '0-1' : '1-0';
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return '1/2-1/2';
  }
  return '*'; // Game in progress or unknown
}

/**
 * Normalize PGN string to fix common formatting issues
 *
 * @param {string} pgnString - Raw PGN string
 * @returns {string} Normalized PGN string
 */
function normalizePGN(pgnString) {
  // Fix issue where moves start immediately after headers without blank line
  // Pattern 1: ][BlackElo "?"]1. e4 -> ][BlackElo "?"]\n\n1. e4
  // Pattern 2: Headers on same line as moves (no newline at all)

  // Strip out PGN comments and variations using character-by-character parsing
  // to handle nested structures correctly
  let result = '';
  let inBraceComment = 0;  // Track nesting depth of { } comments
  let inParenVariation = 0; // Track nesting depth of ( ) variations
  let inHeader = false;     // Track if we're inside a PGN header

  for (let i = 0; i < pgnString.length; i++) {
    const char = pgnString[i];
    const prevChar = i > 0 ? pgnString[i - 1] : '';

    // Track when we're inside headers (don't strip braces/parens from header values)
    if (char === '[' && !inBraceComment && !inParenVariation) {
      inHeader = true;
      result += char;
    } else if (char === ']' && inHeader && !inBraceComment && !inParenVariation) {
      inHeader = false;
      result += char;
    } else if (inHeader) {
      // Inside header - keep everything
      result += char;
    } else if (char === '{') {
      // Start of brace comment
      inBraceComment++;
    } else if (char === '}' && inBraceComment > 0) {
      // End of brace comment
      inBraceComment--;
    } else if (char === '(' && !inBraceComment) {
      // Start of variation (only count if not in comment)
      inParenVariation++;
    } else if (char === ')' && inParenVariation > 0 && !inBraceComment) {
      // End of variation (only count if not in comment)
      inParenVariation--;
    } else if (!inBraceComment && !inParenVariation) {
      // Not in comment or variation - keep the character
      result += char;
    }
  }

  pgnString = result;

  // Fix headers that have moves on the same line (most critical issue)
  // Pattern: [Header "value"]1. e4 -> [Header "value"]\n\n1. e4
  pgnString = pgnString.replace(/(\][^\n]*?)(\d+\.\s*[a-hNBRQKO])/g, '$1\n\n$2');

  // Find the last header line and ensure there's a blank line before moves
  const lines = pgnString.split('\n');
  const normalizedLines = [];
  let lastHeaderIndex = -1;

  // Find the last header line
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^\[[\w]+\s+"[^"]*"\]/)) {
      lastHeaderIndex = i;
    }
  }

  // Rebuild with blank line after last header
  for (let i = 0; i < lines.length; i++) {
    normalizedLines.push(lines[i]);

    // Add blank line after last header if next line starts with moves
    if (i === lastHeaderIndex && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      // Check if next line starts with move notation (e.g., "1. e4" or "1.e4")
      if (nextLine.match(/^1\.\s*[a-hNBRQKO]/)) {
        normalizedLines.push(''); // Add blank line
      }
    }
  }

  return normalizedLines.join('\n');
}

/**
 * Split multi-game PGN string into individual games
 *
 * @param {string} pgnData - Multi-game PGN string
 * @returns {Array<string>} Array of individual PGN strings
 */
function splitPGN(pgnData) {
  // Games are separated by double newlines followed by any PGN header
  // Look for patterns like \n\n[Event, \n\n[White, \n\n[Site, etc.
  // Most games start with [Event, but some may start with other headers
  const games = pgnData
    .split(/\n\n(?=\[(?:Event|White|Site|Date|Round)\s)/)
    .map(g => normalizePGN(g.trim())) // Normalize each game
    .filter(g => g.length > 0);

  return games;
}

/**
 * Parse multiple games from a PGN file/string
 * 
 * @param {string} pgnData - Multi-game PGN string
 * @returns {Object} Parsing results with valid games and errors
 */
function parseMultipleGames(pgnData) {
  const gameStrings = splitPGN(pgnData);
  const results = {
    valid: [],
    errors: [],
    totalGames: gameStrings.length,
    validCount: 0,
    errorCount: 0
  };
  
  gameStrings.forEach((gameString, index) => {
    const parsed = parseSingleGame(gameString, index);
    
    if (parsed) {
      results.valid.push(parsed);
      results.validCount++;
    } else {
      results.errors.push({
        gameIndex: index,
        pgnSample: gameString.substring(0, 200) + '...'
      });
      results.errorCount++;
    }
  });
  
  return results;
}

/**
 * Generate FEN positions for each move in a game
 * Used for Stockfish analysis
 *
 * @param {string} pgnString - The PGN notation
 * @returns {Array<string>} Array of FEN positions (one per move)
 */
function generatePositions(pgnString) {
  const chess = new Chess();
  const positions = [];

  try {
    chess.loadPgn(pgnString);
    chess.reset(); // Start from initial position

    // Get starting position
    positions.push(chess.fen());

    // Get moves and replay to generate FEN for each position
    const moves = chess.history({ verbose: true });
    chess.reset(); // Reset again to replay

    moves.forEach(move => {
      chess.move(move.san);
      positions.push(chess.fen());
    });

    return positions;
  } catch (error) {
    console.warn(`Failed to generate positions: ${error.message}`);
    return [];
  }
}

/**
 * Get player names from PGN headers
 *
 * @param {Object} headers - PGN headers
 * @returns {Object} Player information
 */
function getPlayerInfo(headers) {
  return {
    white: headers.White || 'Unknown',
    black: headers.Black || 'Unknown',
    whiteElo: headers.WhiteElo ? parseInt(headers.WhiteElo) : null,
    blackElo: headers.BlackElo ? parseInt(headers.BlackElo) : null,
    event: headers.Event || 'Unknown',
    site: headers.Site || 'Unknown',
    date: headers.Date || 'Unknown',
    round: headers.Round || 'Unknown'
  };
}

module.exports = {
  parseSingleGame,
  parseMultipleGames,
  splitPGN,
  extractHeaders,
  getPlayerInfo,
  countPieces,
  analyzeSpecialMoves,
  normalizePGN
};
