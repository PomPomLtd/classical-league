/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Stats Calculator Utility
 *
 * Aggregates statistics from multiple parsed chess games.
 * Generates comprehensive stats matching the schema defined in STATS.md
 *
 * @module stats-calculator
 */

const { analyzeGamePhases, getPhaseStatistics } = require('./game-phases');
const { getOpeningName } = require('./chess-openings');
const { calculateOverview } = require('./calculators/overview');
const { calculateResults } = require('./calculators/results');
const { calculateGamePhases } = require('./calculators/game-phases');
const { calculateCheckmates } = require('./calculators/checkmates');
const { calculateOpenings } = require('./calculators/openings');
const { calculateTactics } = require('./calculators/tactics');
const { calculatePieceStats } = require('./calculators/pieces');
const { calculateBoardHeatmap } = require('./calculators/heatmap');
const { calculateAwards } = require('./calculators/awards');

/**
 * Calculate comprehensive statistics from parsed games
 *
 * @param {Array} parsedGames - Array of parsed game objects from pgn-parser
 * @param {number} roundNumber - Round number
 * @param {number} seasonNumber - Season number
 * @returns {Object} Complete statistics object
 */
function calculateStats(parsedGames, roundNumber, seasonNumber) {
  const stats = {
    roundNumber,
    seasonNumber,
    generatedAt: new Date().toISOString(),
    overview: calculateOverview(parsedGames),
    gamePhases: calculateGamePhases(parsedGames),
    results: calculateResults(parsedGames),
    openings: calculateOpenings(parsedGames),
    tactics: calculateTactics(parsedGames),
    pieces: calculatePieceStats(parsedGames),
    checkmates: calculateCheckmates(parsedGames),
    boardHeatmap: calculateBoardHeatmap(parsedGames),
    awards: calculateAwards(parsedGames),
    funStats: calculateFunStats(parsedGames)
  };

  return stats;
}

/**
 * Calculate fun and interesting statistics
 */
function calculateFunStats(games) {
  let fastestQueenTrade = { moves: Infinity, gameIndex: null };
  let slowestQueenTrade = { moves: 0, gameIndex: null };
  let longestCaptureSequence = { length: 0, gameIndex: null, startMove: 0 };
  let longestCheckSequence = { length: 0, gameIndex: null, startMove: 0 };
  let pawnStorm = { count: 0, gameIndex: null };
  let pieceLoyalty = { moves: 0, gameIndex: null, piece: null, square: null };
  let squareTourist = { squares: 0, gameIndex: null, piece: null };
  let castlingRace = { moves: Infinity, gameIndex: null, winner: null };
  let openingHipster = { gameIndex: null, eco: null, name: null, moves: null, obscurityScore: 0 };
  let dadbodShuffler = { moves: 0, gameIndex: null, color: null };
  let sportyQueen = { distance: 0, gameIndex: null, color: null };
  let edgeLord = { moves: 0, gameIndex: null, color: null };
  let rookLift = { moveNumber: Infinity, gameIndex: null, color: null, rook: null };
  let centerStage = { moves: 0, gameIndex: null, piece: null, startSquare: null, color: null };
  let darkLord = { captures: 0, gameIndex: null, color: null };

  games.forEach((game, idx) => {
    // Track queen trades
    let whiteQueenCaptured = false;
    let blackQueenCaptured = false;
    let queenTradeMoveNumber = null;

    // Track capture sequences
    let currentCaptureSequence = 0;
    let maxCaptureSequence = 0;
    let captureSequenceStart = 0;
    let tempCaptureStart = 0;

    // Track check sequences
    let currentCheckSequence = 0;
    let maxCheckSequence = 0;
    let checkSequenceStart = 0;
    let tempCheckStart = 0;

    // Get phase info for pawn storm calculation
    const { Chess } = require('chess.js');
    const phases = analyzeGamePhases(game.moveList, game.pgn);

    // Track piece positions for loyalty and tourist awards
    const piecePositions = {}; // { 'w_r_a1': ['a1', 'a2', ...], ... }
    const pieceStartSquares = {}; // { 'w_r_a1': 'a1', ... }

    // Track castling for castling race
    let whiteCastled = false;
    let blackCastled = false;
    let firstCastleMove = null;
    let firstCastleColor = null;

    // Track king moves for dadbod shuffler
    let whiteKingMoves = 0;
    let blackKingMoves = 0;

    // Track queen travel distance (Manhattan distance on board)
    let whiteQueenDistance = 0;
    let blackQueenDistance = 0;

    // Track edge moves (a/h files)
    let whiteEdgeMoves = 0;
    let blackEdgeMoves = 0;

    // Track rook lifts (first time rook leaves back rank)
    let whiteRookLifted = { a1: false, h1: false };
    let blackRookLifted = { a8: false, h8: false };
    let firstRookLift = null;

    // Track piece center activity (d4, d5, e4, e5)
    const centerSquares = new Set(['d4', 'd5', 'e4', 'e5']);
    const pieceCenterActivity = {}; // { 'w_r_a1': { moves: 5, piece: 'r', startSquare: 'a1', color: 'w' } }

    // Track dark square captures (a1, c1, e1, g1, b2, d2, f2, h2, etc.)
    let whiteDarkCaptures = 0;
    let blackDarkCaptures = 0;

    // Helper to check if square is dark
    const isDarkSquare = (square) => {
      const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
      const rank = parseInt(square[1]) - 1; // 0-7
      return (file + rank) % 2 === 1; // Dark squares have odd sum
    };

    // Helper function to calculate Manhattan distance between two squares
    const calculateDistance = (from, to) => {
      const fromFile = from.charCodeAt(0) - 'a'.charCodeAt(0);
      const fromRank = parseInt(from[1]) - 1;
      const toFile = to.charCodeAt(0) - 'a'.charCodeAt(0);
      const toRank = parseInt(to[1]) - 1;
      return Math.abs(toFile - fromFile) + Math.abs(toRank - fromRank);
    };

    game.moveList.forEach((move, moveIdx) => {
      // Queen trade detection
      if (move.captured === 'q') {
        if (move.color === 'w') {
          blackQueenCaptured = true;
        } else {
          whiteQueenCaptured = true;
        }
      }

      if (whiteQueenCaptured && blackQueenCaptured && queenTradeMoveNumber === null) {
        queenTradeMoveNumber = Math.ceil((moveIdx + 1) / 2); // Convert to full moves
      }

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

      // Track castling for castling race
      if (move.flags && (move.flags.includes('k') || move.flags.includes('q'))) {
        if (move.color === 'w' && !whiteCastled) {
          whiteCastled = true;
          if (firstCastleMove === null) {
            firstCastleMove = Math.ceil((moveIdx + 1) / 2);
            firstCastleColor = 'white';
          }
        } else if (move.color === 'b' && !blackCastled) {
          blackCastled = true;
          if (firstCastleMove === null) {
            firstCastleMove = Math.ceil((moveIdx + 1) / 2);
            firstCastleColor = 'black';
          }
        }
      }

      // Track king moves for dadbod shuffler
      if (move.piece === 'k') {
        if (move.color === 'w') {
          whiteKingMoves++;
        } else {
          blackKingMoves++;
        }
      }

      // Track queen movement distance for sporty queen
      if (move.piece === 'q') {
        const distance = calculateDistance(move.from, move.to);
        if (move.color === 'w') {
          whiteQueenDistance += distance;
        } else {
          blackQueenDistance += distance;
        }
      }

      // Track edge moves (a/h files)
      const toFile = move.to[0];
      const fromFile = move.from[0];
      if (toFile === 'a' || toFile === 'h' || fromFile === 'a' || fromFile === 'h') {
        if (move.color === 'w') {
          whiteEdgeMoves++;
        } else {
          blackEdgeMoves++;
        }
      }

      // Track dark square captures
      if (move.captured && isDarkSquare(move.to)) {
        if (move.color === 'w') {
          whiteDarkCaptures++;
        } else {
          blackDarkCaptures++;
        }
      }

      // Track rook lifts (first time rook leaves back rank)
      if (move.piece === 'r') {
        const fromRank = move.from[1];
        const toRank = move.to[1];

        // White rooks leaving rank 1
        if (move.color === 'w' && fromRank === '1' && toRank !== '1') {
          const startSquare = move.from;
          if (!whiteRookLifted[startSquare] && firstRookLift === null) {
            whiteRookLifted[startSquare] = true;
            firstRookLift = {
              moveNumber: Math.ceil((moveIdx + 1) / 2),
              gameIndex: idx,
              color: 'White',
              rook: `White's ${startSquare} Rook`,
              square: startSquare,
              white: game.headers.White || 'Unknown',
              black: game.headers.Black || 'Unknown'
            };
          }
        }

        // Black rooks leaving rank 8
        if (move.color === 'b' && fromRank === '8' && toRank !== '8') {
          const startSquare = move.from;
          if (!blackRookLifted[startSquare] && firstRookLift === null) {
            blackRookLifted[startSquare] = true;
            firstRookLift = {
              moveNumber: Math.ceil((moveIdx + 1) / 2),
              gameIndex: idx,
              color: 'Black',
              rook: `Black's ${startSquare} Rook`,
              square: startSquare,
              white: game.headers.White || 'Unknown',
              black: game.headers.Black || 'Unknown'
            };
          }
        }
      }

      // Track center square activity for all pieces
      if (centerSquares.has(move.to)) {
        // Create unique piece key based on first time we see it
        let pieceKey = null;

        // Find existing piece key
        for (const existingKey in pieceCenterActivity) {
          const [existingColor, existingPiece] = existingKey.split('_');
          if (existingColor === move.color && existingPiece === move.piece) {
            // Check if this piece came from a square we've seen
            const existingData = pieceCenterActivity[existingKey];
            if (existingData.lastSquare === move.from) {
              pieceKey = existingKey;
              break;
            }
          }
        }

        // Create new key if needed
        if (!pieceKey) {
          // Find starting square by looking for first occurrence of this piece
          let startSquare = move.from;
          // If this is the first move of this piece, use 'from' as start square
          pieceKey = `${move.color}_${move.piece}_${startSquare}`;
          pieceCenterActivity[pieceKey] = {
            moves: 0,
            piece: move.piece,
            startSquare: startSquare,
            color: move.color,
            lastSquare: move.from
          };
        }

        pieceCenterActivity[pieceKey].moves++;
        pieceCenterActivity[pieceKey].lastSquare = move.to;
      } else {
        // Update lastSquare even when not in center
        for (const key in pieceCenterActivity) {
          const data = pieceCenterActivity[key];
          if (data.lastSquare === move.from && data.color === move.color && data.piece === move.piece) {
            data.lastSquare = move.to;
          }
        }
      }

      // Track piece positions for tourist award
      // Use a unique key based on the first square we see this piece on
      let pieceKey = null;

      // Find if this piece already has a key (by checking if any existing key's piece moved TO this square)
      for (const existingKey in piecePositions) {
        const [existingColor, existingPiece] = existingKey.split('_');
        if (existingColor === move.color && existingPiece === move.piece) {
          const positions = Array.from(piecePositions[existingKey]);
          if (positions.includes(move.from)) {
            pieceKey = existingKey;
            break;
          }
        }
      }

      // If no existing key, create new one with current 'from' square as start
      if (!pieceKey) {
        pieceKey = `${move.color}_${move.piece}_${move.from}`;
        piecePositions[pieceKey] = new Set();
        pieceStartSquares[pieceKey] = move.from;
      }

      piecePositions[pieceKey].add(move.from);
      piecePositions[pieceKey].add(move.to);
    });

    // Calculate pawn storm (pawn moves in opening phase)
    let openingPawnMoves = 0;
    for (let i = 0; i < Math.min(phases.openingEnd, game.moveList.length); i++) {
      if (game.moveList[i].piece === 'p') {
        openingPawnMoves++;
      }
    }

    if (openingPawnMoves > pawnStorm.count) {
      pawnStorm = {
        count: openingPawnMoves,
        gameIndex: idx,
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown'
      };
    }

    // Calculate piece loyalty (piece that stayed on starting square longest)
    Object.entries(pieceStartSquares).forEach(([pieceKey, startSquare]) => {
      const positions = Array.from(piecePositions[pieceKey]);
      const firstMove = positions.findIndex(sq => sq !== startSquare);
      const movesOnStart = firstMove === -1 ? game.moveList.length : firstMove;

      if (movesOnStart > pieceLoyalty.moves) {
        const [color, piece] = pieceKey.split('_');
        const pieceNames = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
        pieceLoyalty = {
          moves: movesOnStart,
          gameIndex: idx,
          piece: pieceNames[piece] || piece,
          square: startSquare,
          white: game.headers.White || 'Unknown',
          black: game.headers.Black || 'Unknown'
        };
      }
    });

    // Calculate square tourist (piece that visited most squares)
    Object.entries(piecePositions).forEach(([pieceKey, positions]) => {
      const uniqueSquares = positions.size;
      if (uniqueSquares > squareTourist.squares) {
        const [color, piece, startSquare] = pieceKey.split('_');
        const pieceNames = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
        const colorName = color === 'w' ? 'White' : 'Black';
        squareTourist = {
          squares: uniqueSquares,
          gameIndex: idx,
          piece: pieceNames[piece] || piece,
          color: colorName,
          startSquare: startSquare,
          white: game.headers.White || 'Unknown',
          black: game.headers.Black || 'Unknown'
        };
      }
    });

    // Update fastest queen trade
    if (queenTradeMoveNumber !== null && queenTradeMoveNumber < fastestQueenTrade.moves) {
      fastestQueenTrade = {
        moves: queenTradeMoveNumber,
        gameIndex: idx,
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown'
      };
    }

    // Update slowest queen trade
    if (queenTradeMoveNumber !== null && queenTradeMoveNumber > slowestQueenTrade.moves) {
      slowestQueenTrade = {
        moves: queenTradeMoveNumber,
        gameIndex: idx,
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown'
      };
    }

    // Update longest capture sequence
    if (maxCaptureSequence > longestCaptureSequence.length) {
      longestCaptureSequence = {
        length: maxCaptureSequence,
        gameIndex: idx,
        startMove: Math.ceil((captureSequenceStart + 1) / 2),
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown'
      };
    }

    // Update longest check sequence
    if (maxCheckSequence > longestCheckSequence.length) {
      longestCheckSequence = {
        length: maxCheckSequence,
        gameIndex: idx,
        startMove: Math.ceil((checkSequenceStart + 1) / 2),
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown'
      };
    }

    // Update castling race (earliest castling move wins)
    if (firstCastleMove !== null && firstCastleMove < castlingRace.moves) {
      castlingRace = {
        moves: firstCastleMove,
        gameIndex: idx,
        winner: firstCastleColor,
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown'
      };
    }

    // Update dadbod shuffler (most king moves)
    const totalKingMoves = Math.max(whiteKingMoves, blackKingMoves);
    if (totalKingMoves > dadbodShuffler.moves) {
      dadbodShuffler = {
        moves: totalKingMoves,
        gameIndex: idx,
        color: whiteKingMoves > blackKingMoves ? 'White' : 'Black',
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown'
      };
    }

    // Update sporty queen (queen that traveled the most distance)
    const maxQueenDistance = Math.max(whiteQueenDistance, blackQueenDistance);
    if (maxQueenDistance > sportyQueen.distance) {
      sportyQueen = {
        distance: maxQueenDistance,
        gameIndex: idx,
        color: whiteQueenDistance > blackQueenDistance ? 'White' : 'Black',
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown'
      };
    }

    // Check for opening hipster award (most obscure opening)
    // Get opening for this game (first 6 moves)
    if (game.moveList.length >= 6) {
      const sequence = game.moveList.slice(0, 6).map(m => m.san).join(' ');
      const opening = getOpeningName(sequence);

      if (opening && opening.name) {
        // Calculate obscurity score: length of name + specificity (has colon = more specific)
        const hasColon = opening.name.includes(':');
        const nameLength = opening.name.length;
        const obscurityScore = nameLength + (hasColon ? 20 : 0);

        if (obscurityScore > openingHipster.obscurityScore) {
          openingHipster = {
            gameIndex: idx,
            eco: opening.eco,
            name: opening.name,
            moves: sequence,
            obscurityScore,
            white: game.headers.White || 'Unknown',
            black: game.headers.Black || 'Unknown'
          };
        }
      }
    }

    // Update edge lord (most edge moves)
    const totalEdgeMoves = Math.max(whiteEdgeMoves, blackEdgeMoves);
    if (totalEdgeMoves > edgeLord.moves) {
      edgeLord = {
        moves: totalEdgeMoves,
        gameIndex: idx,
        color: whiteEdgeMoves > blackEdgeMoves ? 'White' : 'Black',
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown'
      };
    }

    // Update rook lift (earliest rook lift in the tournament)
    if (firstRookLift !== null && firstRookLift.moveNumber < rookLift.moveNumber) {
      rookLift = firstRookLift;
    }

    // Update center stage (piece with most center square activity)
    Object.entries(pieceCenterActivity).forEach(([pieceKey, data]) => {
      if (data.moves > centerStage.moves) {
        const pieceNames = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };
        const colorName = data.color === 'w' ? 'White' : 'Black';
        centerStage = {
          moves: data.moves,
          gameIndex: idx,
          piece: `${colorName}'s ${data.startSquare} ${pieceNames[data.piece]}`,
          startSquare: data.startSquare,
          color: colorName,
          white: game.headers.White || 'Unknown',
          black: game.headers.Black || 'Unknown'
        };
      }
    });

    // Update dark lord (most dark square captures)
    const totalDarkCaptures = Math.max(whiteDarkCaptures, blackDarkCaptures);
    if (totalDarkCaptures > darkLord.captures) {
      darkLord = {
        captures: totalDarkCaptures,
        gameIndex: idx,
        color: whiteDarkCaptures > blackDarkCaptures ? 'White' : 'Black',
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown'
      };
    }
  });

  return {
    fastestQueenTrade: fastestQueenTrade.moves !== Infinity ? fastestQueenTrade : null,
    slowestQueenTrade: slowestQueenTrade.moves > 0 ? slowestQueenTrade : null,
    longestCaptureSequence: longestCaptureSequence.length > 0 ? longestCaptureSequence : null,
    longestCheckSequence: longestCheckSequence.length > 0 ? longestCheckSequence : null,
    pawnStorm: pawnStorm.count > 0 ? pawnStorm : null,
    pieceLoyalty: pieceLoyalty.moves >= 30 ? pieceLoyalty : null, // Only show if 30+ moves (15 full moves)
    squareTourist: squareTourist.squares > 0 ? squareTourist : null,
    castlingRace: castlingRace.moves !== Infinity ? castlingRace : null,
    openingHipster: openingHipster.gameIndex !== null ? openingHipster : null,
    dadbodShuffler: dadbodShuffler.moves > 0 ? dadbodShuffler : null,
    sportyQueen: sportyQueen.distance > 0 ? sportyQueen : null,
    edgeLord: edgeLord.moves > 0 ? edgeLord : null,
    rookLift: rookLift.moveNumber !== Infinity ? rookLift : null,
    centerStage: centerStage.moves > 0 ? centerStage : null,
    darkLord: darkLord.captures > 0 ? darkLord : null
  };
}

module.exports = {
  calculateStats,
  calculateFunStats
};
