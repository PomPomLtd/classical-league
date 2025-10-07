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
 * Calculate overview statistics
 * Note: chess.js history.length gives us half-moves (plies), so we divide by 2 for full moves
 */
function calculateOverview(games) {
  const totalMoves = games.reduce((sum, g) => sum + g.moves, 0);

  const longestGame = games.reduce((longest, game, idx) => {
    return game.moves > longest.moves ? { moves: game.moves, gameIndex: idx, game } : longest;
  }, { moves: 0, gameIndex: 0, game: null });

  const shortestGame = games.reduce((shortest, game, idx) => {
    return game.moves < shortest.moves ? { moves: game.moves, gameIndex: idx, game } : shortest;
  }, { moves: Infinity, gameIndex: 0, game: null });

  return {
    totalGames: games.length,
    totalMoves,
    averageGameLength: totalMoves / games.length / 2, // Divide by 2 for full moves
    longestGame: {
      moves: Math.ceil(longestGame.moves / 2), // Divide by 2 for full moves
      white: longestGame.game.headers.White || 'Unknown',
      black: longestGame.game.headers.Black || 'Unknown',
      result: longestGame.game.result
    },
    shortestGame: {
      moves: Math.ceil(shortestGame.moves / 2), // Divide by 2 for full moves
      white: shortestGame.game.headers.White || 'Unknown',
      black: shortestGame.game.headers.Black || 'Unknown',
      result: shortestGame.game.result
    }
  };
}

/**
 * Calculate game phase statistics
 * Note: Phase lengths are in half-moves, so we divide by 2 for full moves
 */
function calculateGamePhases(games) {
  const allPhases = games.map(g => analyzeGamePhases(g.moveList, g.pgn));
  const phaseStats = getPhaseStatistics(allPhases);

  return {
    averageOpening: phaseStats.averageOpening / 2,
    averageMiddlegame: phaseStats.averageMiddlegame / 2,
    averageEndgame: phaseStats.averageEndgame / 2,
    longestOpening: {
      moves: Math.ceil(phaseStats.longestOpening.moves / 2),
      white: games[phaseStats.longestOpening.gameIndex].headers.White || 'Unknown',
      black: games[phaseStats.longestOpening.gameIndex].headers.Black || 'Unknown',
      game: `${games[phaseStats.longestOpening.gameIndex].headers.White} vs ${games[phaseStats.longestOpening.gameIndex].headers.Black}`
    },
    longestMiddlegame: {
      moves: Math.ceil(phaseStats.longestMiddlegame.moves / 2),
      white: games[phaseStats.longestMiddlegame.gameIndex].headers.White || 'Unknown',
      black: games[phaseStats.longestMiddlegame.gameIndex].headers.Black || 'Unknown',
      game: `${games[phaseStats.longestMiddlegame.gameIndex].headers.White} vs ${games[phaseStats.longestMiddlegame.gameIndex].headers.Black}`
    },
    longestEndgame: {
      moves: Math.ceil(phaseStats.longestEndgame.moves / 2),
      white: games[phaseStats.longestEndgame.gameIndex].headers.White || 'Unknown',
      black: games[phaseStats.longestEndgame.gameIndex].headers.Black || 'Unknown',
      game: `${games[phaseStats.longestEndgame.gameIndex].headers.White} vs ${games[phaseStats.longestEndgame.gameIndex].headers.Black}`
    }
  };
}

/**
 * Calculate win/loss/draw statistics
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

/**
 * Calculate opening statistics
 */
function calculateOpenings(games) {
  const firstMoves = {};
  const openingSequences = {};

  games.forEach(game => {
    if (game.moveList.length > 0) {
      // First move
      const firstMove = game.moveList[0].san;
      if (!firstMoves[firstMove]) {
        firstMoves[firstMove] = { count: 0, wins: 0, draws: 0, losses: 0 };
      }
      firstMoves[firstMove].count++;

      // Track results for this opening
      if (game.result === '1-0') firstMoves[firstMove].wins++;
      else if (game.result === '1/2-1/2') firstMoves[firstMove].draws++;
      else if (game.result === '0-1') firstMoves[firstMove].losses++;

      // Opening sequence (first 6 moves = 3 moves each side)
      if (game.moveList.length >= 6) {
        const sequence = game.moveList.slice(0, 6).map(m => m.san).join(' ');
        openingSequences[sequence] = (openingSequences[sequence] || 0) + 1;
      }
    }
  });

  // Format first moves with percentages and win rates
  const formattedFirstMoves = {};
  const total = games.length;
  Object.entries(firstMoves).forEach(([move, data]) => {
    formattedFirstMoves[move] = {
      count: data.count,
      percentage: (data.count / total) * 100,
      winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0
    };
  });

  // Get popular sequences with opening names, sorted by popularity then ECO code
  const popularSequences = Object.entries(openingSequences)
    .map(([moves, count]) => {
      const opening = getOpeningName(moves);
      return {
        moves,
        count,
        eco: opening?.eco || null,
        name: opening?.name || null
      };
    })
    .sort((a, b) => {
      // First sort by count (popularity, descending)
      if (a.count !== b.count) return b.count - a.count;

      // Then sort by ECO code alphabetically (nulls last)
      if (a.eco && b.eco) return a.eco.localeCompare(b.eco);
      if (a.eco) return -1;
      if (b.eco) return 1;
      return 0;
    });

  return {
    firstMoves: formattedFirstMoves,
    popularSequences
  };
}

/**
 * Calculate tactical statistics
 */
function calculateTactics(games) {
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

  games.forEach((game, idx) => {
    const sm = game.specialMoves;
    const white = game.headers.White || 'Unknown';
    const black = game.headers.Black || 'Unknown';

    totalCaptures += sm.totalCaptures;
    totalPromotions += sm.totalPromotions;
    totalCastlingKingside += sm.totalCastlingKingside;
    totalCastlingQueenside += sm.totalCastlingQueenside;

    if (sm.totalEnPassant > 0) {
      enPassantGames.push({ white, black, count: sm.totalEnPassant });
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
          white,
          black
        });
      }
    });

    if (sm.totalCaptures > bloodiestGame.captures) {
      bloodiestGame = { captures: sm.totalCaptures, gameIndex: idx, white, black };
    }

    if (sm.totalCaptures < quietestGame.captures) {
      quietestGame = { captures: sm.totalCaptures, gameIndex: idx, white, black };
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
      longestNonCaptureStreak = { moves: maxStreak, gameIndex: idx, white, black };
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

/**
 * Calculate piece statistics
 */
function calculatePieceStats(games) {
  const activity = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  const captured = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  const survival = { rooks: [], queens: [], bishops: [], knights: [] };

  games.forEach(game => {
    // Activity
    game.moveList.forEach(move => {
      activity[move.piece]++;
      if (move.captured) {
        captured[move.captured]++;
      }
    });

    // Survival
    const pc = game.piecesRemaining;
    survival.rooks.push(pc.w_r + pc.b_r);
    survival.queens.push(pc.w_q + pc.b_q);
    survival.bishops.push(pc.w_b + pc.b_b);
    survival.knights.push(pc.w_n + pc.b_n);
  });

  const pieceNames = { p: 'pawns', n: 'knights', b: 'bishops', r: 'rooks', q: 'queens', k: 'kings' };
  const formattedActivity = {};
  Object.entries(activity).forEach(([piece, count]) => {
    formattedActivity[pieceNames[piece]] = count;
  });

  const formattedCaptured = {};
  Object.entries(captured).forEach(([piece, count]) => {
    formattedCaptured[pieceNames[piece]] = count;
  });

  return {
    activity: formattedActivity,
    captured: formattedCaptured,
    survivalRate: {
      rooks: survival.rooks.reduce((a, b) => a + b, 0) / survival.rooks.length / 4,
      queens: survival.queens.reduce((a, b) => a + b, 0) / survival.queens.length / 2,
      bishops: survival.bishops.reduce((a, b) => a + b, 0) / survival.bishops.length / 4,
      knights: survival.knights.reduce((a, b) => a + b, 0) / survival.knights.length / 4
    }
  };
}

/**
 * Calculate checkmate statistics
 */
function calculateCheckmates(games) {
  const byPiece = { queen: 0, rook: 0, bishop: 0, knight: 0, pawn: 0, king: 0 };
  let fastestMate = { moves: Infinity, gameIndex: 0 };

  // Map chess.js piece codes to full names
  const pieceMap = {
    'q': 'queen',
    'r': 'rook',
    'b': 'bishop',
    'n': 'knight',
    'p': 'pawn',
    'k': 'king'
  };

  games.forEach((game, idx) => {
    game.specialMoves.checkmates.forEach(mate => {
      const pieceCode = mate.piece;
      const pieceName = pieceMap[pieceCode];

      if (pieceName && byPiece[pieceName] !== undefined) {
        byPiece[pieceName]++;
      }

      if (mate.moveNumber < fastestMate.moves) {
        fastestMate = {
          moves: Math.ceil(mate.moveNumber / 2), // Divide by 2 for full moves
          gameIndex: idx,
          white: game.headers.White || 'Unknown',
          black: game.headers.Black || 'Unknown',
          winner: mate.color === 'w' ? 'White' : 'Black'
        };
      }
    });
  });

  return {
    byPiece,
    fastest: fastestMate.moves !== Infinity ? fastestMate : null
  };
}

/**
 * Calculate board heatmap statistics
 * Tracks square activity (moves to/from) and captures on each square
 */
function calculateBoardHeatmap(games) {
  const squareActivity = {}; // Total moves to/from each square
  const captureSquares = {}; // Captures on each square

  // Initialize all squares
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

  files.forEach(file => {
    ranks.forEach(rank => {
      const square = file + rank;
      squareActivity[square] = 0;
      captureSquares[square] = 0;
    });
  });

  // Track activity and captures
  games.forEach(game => {
    game.moveList.forEach(move => {
      // Track destination square activity
      if (move.to) {
        squareActivity[move.to] = (squareActivity[move.to] || 0) + 1;
      }

      // Track captures on squares
      if (move.captured && move.to) {
        captureSquares[move.to] = (captureSquares[move.to] || 0) + 1;
      }
    });
  });

  // Find most/least active squares
  const sortedActivity = Object.entries(squareActivity).sort((a, b) => b[1] - a[1]);
  const sortedCaptures = Object.entries(captureSquares).sort((a, b) => b[1] - a[1]);

  // Get non-zero squares for least popular
  const activeSquares = sortedActivity.filter(([sq, count]) => count > 0);

  return {
    bloodiestSquare: {
      square: sortedCaptures[0][0],
      captures: sortedCaptures[0][1],
      description: `${sortedCaptures[0][0]} saw ${sortedCaptures[0][1]} captures`
    },
    mostPopularSquare: {
      square: sortedActivity[0][0],
      visits: sortedActivity[0][1],
      description: `${sortedActivity[0][0]} was visited ${sortedActivity[0][1]} times`
    },
    leastPopularSquare: {
      square: activeSquares[activeSquares.length - 1][0],
      visits: activeSquares[activeSquares.length - 1][1],
      description: `${activeSquares[activeSquares.length - 1][0]} was only visited ${activeSquares[activeSquares.length - 1][1]} times`
    },
    quietestSquares: sortedActivity.filter(([, count]) => count === 0).map(([sq]) => sq),
    top5Bloodiest: sortedCaptures.slice(0, 5).map(([sq, count]) => ({ square: sq, captures: count })),
    top5Popular: sortedActivity.slice(0, 5).map(([sq, count]) => ({ square: sq, visits: count }))
  };
}

/**
 * Calculate awards (fun stats)
 */
function calculateAwards(games) {
  const tactics = calculateTactics(games);
  const checkmates = calculateCheckmates(games);
  const phases = games.map(g => analyzeGamePhases(g.moveList, g.pgn));

  const longestEndgame = phases.reduce((longest, phase, idx) => {
    return phase.endgame > longest.moves ? { moves: phase.endgame, gameIndex: idx } : longest;
  }, { moves: 0, gameIndex: 0 });

  const shortestOpening = phases.reduce((shortest, phase, idx) => {
    if (phase.opening === 0) return shortest;
    return phase.opening < shortest.moves ? { moves: phase.opening, gameIndex: idx } : shortest;
  }, { moves: Infinity, gameIndex: 0 });

  return {
    bloodbath: {
      white: tactics.bloodiestGame.white,
      black: tactics.bloodiestGame.black,
      captures: tactics.bloodiestGame.captures
    },
    pacifist: {
      white: tactics.quietestGame.white,
      black: tactics.quietestGame.black,
      captures: tactics.quietestGame.captures
    },
    speedDemon: checkmates.fastest ? {
      white: checkmates.fastest.white,
      black: checkmates.fastest.black,
      moves: checkmates.fastest.moves,
      winner: checkmates.fastest.winner
    } : null,
    endgameWizard: {
      white: games[longestEndgame.gameIndex].headers.White || 'Unknown',
      black: games[longestEndgame.gameIndex].headers.Black || 'Unknown',
      endgameMoves: Math.ceil(longestEndgame.moves / 2) // Divide by 2 for full moves
    },
    openingSprinter: shortestOpening.moves !== Infinity ? {
      white: games[shortestOpening.gameIndex].headers.White || 'Unknown',
      black: games[shortestOpening.gameIndex].headers.Black || 'Unknown',
      openingMoves: Math.ceil(shortestOpening.moves / 2) // Divide by 2 for full moves
    } : null
  };
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
  calculateOverview,
  calculateGamePhases,
  calculateResults,
  calculateOpenings,
  calculateTactics,
  calculatePieceStats,
  calculateCheckmates,
  calculateBoardHeatmap,
  calculateAwards,
  calculateFunStats
};
