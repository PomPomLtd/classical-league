# Chess Puzzle Generation Research Report

## Executive Summary

This document provides comprehensive research on automatically generating chess puzzles from PGN files, specifically for implementing a "Puzzle of the Round" feature in the Classical League tournament application.

**Key Findings:**
- Multiple proven open-source implementations exist (Python-based)
- Core algorithm relies on Stockfish evaluation + blunder detection
- Your project already has required dependencies (Stockfish 17.1.0, chess.js)
- Implementation is feasible with existing infrastructure

---

## Table of Contents

1. [Research Sources](#research-sources)
2. [Puzzle Generation Algorithm](#puzzle-generation-algorithm)
3. [Technical Implementation Details](#technical-implementation-details)
4. [Existing Tools & Libraries](#existing-tools--libraries)
5. [Implementation Recommendations](#implementation-recommendations)
6. [Integration with Classical League](#integration-with-classical-league)

---

## Research Sources

### Primary Repositories

1. **ornicar/lichess-puzzler** (Official Lichess Generator)
   - 50+ years of CPU time to analyze 300M games
   - Python + Stockfish + MongoDB
   - Production-grade but complex (503 commits, validator system)
   - Generates 5.4M+ rated and tagged puzzles

2. **linrock/chess-puzzle-maker** ⭐ **RECOMMENDED**
   - Simpler, focused implementation
   - Python 3 + Stockfish
   - Clear algorithm with documented thresholds
   - Accepts PGN input, outputs puzzle PGN
   - MIT license

3. **vitogit/pgn-tactics-generator** ⭐ **ALTERNATIVE**
   - Python-based PGN processor
   - Configurable depth and strictness
   - Can download from Lichess or use local files
   - Simple CLI interface

### Research Papers & Articles

- "Generating Tactical Puzzles with Stockfish" (Play Magnus blog)
- "Generating Chess Puzzles Fast with Rust and Stockfish" (Marcus Buffett)
- Chess Stack Exchange discussions on puzzle algorithms
- Academic papers on puzzle difficulty prediction

### Node.js Resources

- **stockfish npm package** (v17.1.0) - Already in your project ✅
- **chess.js** (v1.4.0) - Already in your project ✅
- **node-uci** - UCI protocol for Node.js
- No complete Node.js puzzle generator found (implementation opportunity)

---

## Puzzle Generation Algorithm

### Core Concept

A chess puzzle is extracted when:
1. A player makes a **blunder** (large evaluation swing)
2. There exists a **single clear best move** to punish it
3. The resulting sequence is **forcing** (limited variations)

### Algorithm Steps

```
1. SCAN GAME MOVES
   ├─ Evaluate each position with Stockfish
   ├─ Compare evaluations: position[n-1] vs position[n]
   └─ Detect large swings → Puzzle candidates

2. IDENTIFY CANDIDATES
   ├─ Check evaluation swing thresholds
   ├─ Verify material requirements
   └─ Filter by position type (not too simple endgames)

3. GENERATE PUZZLE
   ├─ Set puzzle starting position (after blunder)
   ├─ Find best move(s) at higher depth
   ├─ Verify single clear solution exists
   ├─ Generate forcing continuation
   └─ Validate puzzle completeness

4. CATEGORIZE & OUTPUT
   ├─ Classify: Mate / Material Gain / Equalize
   ├─ Tag themes (fork, pin, skewer, etc.)
   └─ Export as PGN with solution
```

### Flow Diagram

```
PGN Input
    ↓
Parse Games (chess.js)
    ↓
Scan Each Position (Stockfish @ depth 16)
    ↓
Detect Evaluation Swings (±110-200cp)
    ↓
Candidate Position Found
    ↓
Deep Analysis (Stockfish @ depth 22)
    ↓
Find Best Move(s) + Validate Single Solution
    ↓
Generate Forcing Line (until ambiguity/mate/conclusion)
    ↓
Validate Completeness (≥2 player moves)
    ↓
Categorize & Tag
    ↓
Output Puzzle PGN
```

---

## Technical Implementation Details

### Evaluation Swing Thresholds

Based on **linrock/chess-puzzle-maker** (most transparent implementation):

#### 1. Even to Advantage (Most Common)
```javascript
// From balanced position to significant advantage
if (Math.abs(beforeEval) < 110 && Math.abs(afterEval - beforeEval) >= 110) {
    // Puzzle candidate
}
```
**Example:** Position eval 0.5 pawns → Player blunders → eval swings to -1.5 pawns

#### 2. Winning to Even (Squandered Advantage)
```javascript
// From winning position to balanced
if (Math.abs(beforeEval) > 200 && Math.abs(afterEval) < 110) {
    // Equalization puzzle candidate
}
```
**Example:** Player had +2.5 advantage → blunder → position becomes -0.5

#### 3. Critical Blunders (Sign Flip)
```javascript
// Advantage changes sides
if (Math.abs(beforeEval) > 200 && Math.sign(afterEval) !== Math.sign(beforeEval)) {
    // Critical blunder puzzle
}
```
**Example:** Player had +2.5 → blunder → opponent now has +1.5

#### 4. Checkmate Sequences
```javascript
// Special handling for mate-in-N positions
if (beforeEval.mate !== null || afterEval.mate !== null) {
    // Checkmate puzzle candidate
}
```

### Material Requirements

Puzzles must have sufficient pieces to be interesting:

```javascript
const MIN_TOTAL_MATERIAL = 3;  // Total material points (Q=9, R=5, B/N=3, P=1)
const MIN_PIECES_ON_BOARD = 6;  // Minimum piece count

// Filter out bare endgames
if (totalMaterial < MIN_TOTAL_MATERIAL || pieceCount < MIN_PIECES_ON_BOARD) {
    // Skip position
}
```

### Stockfish Configuration

#### Scanning Phase (Fast)
```javascript
const SCAN_DEPTH = 16;        // Quick pass to find candidates
const SCAN_THREADS = 4;       // Parallel processing
const SCAN_HASH = 512;        // MB memory for hashtables
```

#### Analysis Phase (Deep)
```javascript
const SEARCH_DEPTH = 22;      // Thorough analysis of candidates
const MULTI_PV = 3;           // Check top 3 moves
const SEARCH_HASH = 2048;     // More memory for accuracy
```

**Performance Impact:**
- Depth 8: ~2-5 seconds per game
- Depth 16: ~10-30 seconds per game
- Depth 22: ~30-60 seconds per game

For a 30-game round: **15-30 minutes total** at optimal settings

### Puzzle Validation Criteria

A position becomes a valid puzzle if:

```javascript
// 1. Single clear best move
const bestMoveEval = moves[0].eval;
const secondBestEval = moves[1].eval;
const GAP_THRESHOLD = 100; // centipawns

if (bestMoveEval - secondBestEval < GAP_THRESHOLD) {
    // Too ambiguous, reject
}

// 2. Minimum forcing sequence
const MIN_PLAYER_MOVES = 2;

if (playerMoves < MIN_PLAYER_MOVES) {
    // Too short, reject
}

// 3. Clear outcome
const OUTCOMES = ['mate', 'material_gain', 'equalize'];

if (!hasDefinedOutcome()) {
    // Unclear result, reject
}

// 4. Not too obvious
const TRIVIAL_THRESHOLD = 50; // centipawns advantage gain

if (advantageGain < TRIVIAL_THRESHOLD && !isMate) {
    // Too trivial, reject
}
```

### Puzzle Categories

Based on Lichess classification system:

```javascript
const PUZZLE_CATEGORIES = {
    // By Outcome
    'mate': 'Checkmate in N moves',
    'mateIn1': 'Checkmate in one move',
    'mateIn2': 'Checkmate in two moves',
    'mateIn3': 'Checkmate in three moves',
    'mateIn4+': 'Long checkmate',

    // By Goal
    'advantage': 'Win material or position',
    'equality': 'Equalize from worse position',
    'crushing': 'Convert winning advantage',

    // By Tactic Type
    'fork': 'Double attack',
    'pin': 'Piece cannot move',
    'skewer': 'Attack through valuable piece',
    'discoveredAttack': 'Reveal attack by moving piece',
    'deflection': 'Force piece away from duty',
    'decoy': 'Lure piece to bad square',
    'clearance': 'Open line/square',
    'interference': 'Block opponent piece',
    'desperado': 'Trading doomed piece optimally',
    'zugzwang': 'Any move worsens position',

    // By Theme
    'sacrifice': 'Give up material for advantage',
    'exposed_king': 'Attack vulnerable king',
    'trapped_piece': 'Capture immobilized piece',
    'promotion': 'Promote pawn',
    'underpromotion': 'Promote to non-queen'
};
```

### Move Quality Classification

Your project already has this in `stockfish-evaluator.js`:

```javascript
function classifyMoveQuality(cpLoss) {
  if (cpLoss === 0) return 'excellent';    // Perfect move
  if (cpLoss < 20) return 'good';          // Solid move
  if (cpLoss < 50) return 'inaccuracy';    // Minor mistake
  if (cpLoss < 100) return 'mistake';      // Clear error
  return 'blunder';                         // Major error (PUZZLE!)
}
```

Blunders (≥100cp loss) are prime puzzle candidates.

---

## Existing Tools & Libraries

### Python Implementations

#### 1. linrock/chess-puzzle-maker ⭐

**Pros:**
- Clean, focused implementation
- Well-documented thresholds
- PGN input/output
- Configurable depth
- MIT license

**Cons:**
- Python-only (not Node.js)
- Requires separate Stockfish binary
- Sequential processing (no parallel)

**Usage:**
```bash
# Install
pip3 install -r requirements.txt
sh build-stockfish.sh

# Generate puzzles
./make_puzzles.py --pgn round1.pgn >> puzzles.pgn

# From FEN position
./make_puzzles.py --fen "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

# Scan only (fast preview)
./make_puzzles.py --scan-only --pgn round1.pgn
```

**Key Files:**
- `make_puzzles.py` - Main entry point
- `puzzlemaker/puzzle_finder.py` - Candidate detection (thresholds!)
- `puzzlemaker/puzzle.py` - Puzzle generation & validation
- `puzzlemaker/constants.py` - Configuration values

#### 2. vitogit/pgn-tactics-generator

**Pros:**
- Download from Lichess directly
- Configurable strictness
- Simple configuration
- Good for batch processing

**Cons:**
- Less transparent algorithm
- Older codebase
- Python-only

**Usage:**
```bash
# Install
pip3 install -r requirements.txt
sh build-stockfish.sh

# From Lichess username
python3 download_games.py <username>
python3 main.py --depth=16 --strict=True

# From local PGN
python3 main.py --games=round1.pgn --depth=16 --threads=4

# Output: tactics.pgn
```

**Configuration:**
```bash
--depth=16           # Analysis depth (higher = slower + better)
--strict=True        # Reject ambiguous puzzles
--threads=4          # CPU threads
--memory=2048        # Hash size (MB)
--includeBlunder=True  # Include blunder move in puzzle
```

### JavaScript/Node.js Options

#### Currently Available

1. **stockfish npm package** (v17.1.0)
   - ✅ Already in your project
   - WebAssembly-based Stockfish
   - UCI protocol via postMessage
   - nmrugg/stockfish.js implementation

2. **chess.js** (v1.4.0)
   - ✅ Already in your project
   - Move generation and validation
   - FEN/PGN parsing
   - Position manipulation

3. **Your StockfishEvaluator class**
   - ✅ Already implemented
   - Position evaluation at configurable depth
   - Centipawn loss calculation
   - Move quality classification

#### Missing Component

**No complete Node.js puzzle generator exists!** This is an implementation opportunity.

You would need to build:
- Candidate detection (evaluation swing analysis)
- Multi-PV analysis (check top 3 moves)
- Forcing line generation
- Puzzle validation
- Category/theme tagging

---

## Implementation Recommendations

### Recommended Approach: Hybrid Strategy

**Phase 1: Quick Win (Python Bridge)** ⏱️ 1-2 days
Use existing Python tool as subprocess from Node.js

**Phase 2: Native Solution (Node.js)** ⏱️ 1-2 weeks
Build custom puzzle generator using your existing infrastructure

### Phase 1: Python Bridge Implementation

Leverage `linrock/chess-puzzle-maker` via Node.js subprocess:

```javascript
// scripts/generate-puzzles.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Generate puzzles from PGN using Python bridge
 */
async function generatePuzzlesFromPGN(pgnData, roundNumber, seasonNumber) {
    console.log('🧩 Generating puzzles for round', roundNumber);

    // 1. Save PGN to temp file
    const tempPgnPath = `/tmp/round-${seasonNumber}-${roundNumber}.pgn`;
    fs.writeFileSync(tempPgnPath, pgnData);

    // 2. Run Python puzzle maker
    const pythonScript = path.join(__dirname, 'python-bridge', 'make_puzzles.py');
    const puzzlesPgn = execSync(
        `python3 ${pythonScript} --pgn ${tempPgnPath}`,
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    // 3. Parse puzzle PGN and extract best puzzle
    const puzzles = parsePuzzlePGN(puzzlesPgn);

    // 4. Select "Puzzle of the Round" (highest rated or most interesting)
    const bestPuzzle = selectBestPuzzle(puzzles);

    // 5. Return structured data
    return {
        fen: bestPuzzle.fen,
        moves: bestPuzzle.solution,
        category: bestPuzzle.category,
        rating: bestPuzzle.estimatedRating,
        gameUrl: bestPuzzle.sourceGame
    };
}

/**
 * Select most interesting puzzle from candidates
 */
function selectBestPuzzle(puzzles) {
    // Prioritize:
    // 1. Checkmate puzzles (mate in 2-3 most interesting)
    // 2. Brilliant sacrifices (material loss → advantage)
    // 3. Complex tactical sequences (multiple themes)
    // 4. Avoid trivial captures

    const scored = puzzles.map(p => ({
        puzzle: p,
        score: calculateInterestScore(p)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored[0].puzzle;
}

function calculateInterestScore(puzzle) {
    let score = 0;

    // Mate puzzles (prefer mate in 2-3)
    if (puzzle.category === 'mateIn2') score += 100;
    if (puzzle.category === 'mateIn3') score += 90;
    if (puzzle.category === 'mateIn1') score += 70; // Too easy

    // Tactical themes
    if (puzzle.themes.includes('sacrifice')) score += 50;
    if (puzzle.themes.includes('discoveredAttack')) score += 40;
    if (puzzle.themes.includes('deflection')) score += 35;

    // Complexity
    score += puzzle.solution.length * 5; // Longer = more interesting

    // Estimated difficulty (prefer intermediate)
    if (puzzle.estimatedRating > 1500 && puzzle.estimatedRating < 2000) {
        score += 30;
    }

    return score;
}
```

**Pros:**
- ✅ Quick implementation
- ✅ Proven algorithm
- ✅ No need to rewrite complex logic
- ✅ Can iterate on selection criteria

**Cons:**
- ❌ Requires Python + Stockfish binary
- ❌ Additional dependency
- ❌ Slower than native (subprocess overhead)
- ❌ Harder to customize algorithm

**Setup Required:**
```bash
# Install Python tools
cd scripts/python-bridge
git clone https://github.com/linrock/chess-puzzle-maker.git
cd chess-puzzle-maker
pip3 install -r requirements.txt
sh build-stockfish.sh
```

### Phase 2: Native Node.js Implementation

Build custom puzzle generator leveraging your existing infrastructure:

```javascript
// scripts/utils/puzzle-generator.js

const { Chess } = require('chess.js');
const { StockfishEvaluator } = require('./stockfish-evaluator');

class PuzzleGenerator {
    constructor(depth = 16, searchDepth = 22) {
        this.scanDepth = depth;
        this.searchDepth = searchDepth;
        this.evaluator = new StockfishEvaluator(depth);
    }

    /**
     * Find puzzle candidates in games
     */
    async findCandidates(games) {
        const candidates = [];

        for (const game of games) {
            const chess = new Chess();
            const history = game.moves;
            const evaluations = [];

            // 1. Scan game positions
            console.log(`Scanning game: ${game.white} vs ${game.black}`);

            for (const move of history) {
                chess.move(move);
                const fen = chess.fen();
                const eval = await this.evaluator.evaluatePosition(fen);
                evaluations.push({ fen, eval, move });
            }

            // 2. Detect evaluation swings
            for (let i = 1; i < evaluations.length; i++) {
                const prev = evaluations[i - 1];
                const curr = evaluations[i];

                if (this.isBlunder(prev.eval, curr.eval)) {
                    candidates.push({
                        gameId: game.id,
                        moveNumber: i,
                        position: curr.fen,
                        beforeEval: prev.eval,
                        afterEval: curr.eval,
                        blunderMove: curr.move
                    });
                }
            }
        }

        console.log(`Found ${candidates.length} puzzle candidates`);
        return candidates;
    }

    /**
     * Check if position is a blunder (puzzle candidate)
     */
    isBlunder(beforeEval, afterEval) {
        const before = beforeEval.score;
        const after = afterEval.score;

        // 1. Even to advantage (±110cp swing)
        if (Math.abs(before) < 110 && Math.abs(after - before) >= 110) {
            return true;
        }

        // 2. Winning to even (squandered +200cp)
        if (Math.abs(before) > 200 && Math.abs(after) < 110) {
            return true;
        }

        // 3. Sign flip (critical blunder)
        if (Math.abs(before) > 200 && Math.sign(after) !== Math.sign(before)) {
            return true;
        }

        // 4. Checkmate blunders
        if (beforeEval.mate !== null || afterEval.mate !== null) {
            return true;
        }

        return false;
    }

    /**
     * Generate full puzzle from candidate
     */
    async generatePuzzle(candidate) {
        // Switch to deeper analysis
        const deepEvaluator = new StockfishEvaluator(this.searchDepth);

        // 1. Analyze position deeply
        const chess = new Chess(candidate.position);
        const legalMoves = chess.moves({ verbose: true });

        // 2. Evaluate all legal moves (Multi-PV simulation)
        const moveEvaluations = [];
        for (const move of legalMoves.slice(0, 5)) { // Top 5 moves
            chess.move(move);
            const fen = chess.fen();
            const eval = await deepEvaluator.evaluatePosition(fen);
            moveEvaluations.push({ move: move.san, eval });
            chess.undo();
        }

        // Sort by evaluation
        moveEvaluations.sort((a, b) => b.eval.score - a.eval.score);

        // 3. Validate single clear solution
        const best = moveEvaluations[0];
        const secondBest = moveEvaluations[1];
        const gap = Math.abs(best.eval.score - secondBest.eval.score);

        if (gap < 100) {
            // Too ambiguous
            return null;
        }

        // 4. Generate forcing line
        const solution = await this.generateSolution(candidate.position, best.move);

        if (solution.length < 2) {
            // Too short
            return null;
        }

        // 5. Categorize puzzle
        const category = this.categorizePuzzle(candidate, best.eval, solution);

        deepEvaluator.quit();

        return {
            fen: candidate.position,
            moves: solution,
            category: category,
            evaluation: best.eval,
            alternatives: moveEvaluations.slice(1, 4),
            gameId: candidate.gameId,
            moveNumber: candidate.moveNumber
        };
    }

    /**
     * Generate forcing continuation from starting position
     */
    async generateSolution(fen, firstMove) {
        const chess = new Chess(fen);
        const solution = [firstMove];

        chess.move(firstMove);
        let moveCount = 0;
        const MAX_MOVES = 10;

        while (moveCount < MAX_MOVES && !chess.isGameOver()) {
            // Get best move
            const currentFen = chess.fen();
            const eval = await this.evaluator.evaluatePosition(currentFen);

            if (!eval.bestMove) break;

            try {
                chess.move(eval.bestMove);
                solution.push(eval.bestMove);
                moveCount++;

                // Stop if position becomes ambiguous or advantage unclear
                if (Math.abs(eval.score) < 50 && eval.mate === null) {
                    break;
                }
            } catch (e) {
                // Invalid move from engine
                break;
            }
        }

        return solution;
    }

    /**
     * Categorize puzzle by type
     */
    categorizePuzzle(candidate, bestEval, solution) {
        // Checkmate
        if (bestEval.mate !== null) {
            const mateIn = Math.abs(bestEval.mate);
            if (mateIn === 1) return 'mateIn1';
            if (mateIn === 2) return 'mateIn2';
            if (mateIn === 3) return 'mateIn3';
            return 'mate';
        }

        // Material gain
        const evalSwing = Math.abs(bestEval.score - candidate.afterEval.score);
        if (evalSwing > 300) return 'crushing';
        if (evalSwing > 100) return 'advantage';

        // Equalization
        if (candidate.beforeEval.score < -200 && Math.abs(bestEval.score) < 90) {
            return 'equality';
        }

        return 'advantage';
    }

    /**
     * Clean up resources
     */
    quit() {
        this.evaluator.quit();
    }
}

module.exports = { PuzzleGenerator };
```

**Pros:**
- ✅ Native Node.js (no Python dependency)
- ✅ Uses existing Stockfish infrastructure
- ✅ Full customization control
- ✅ Integrated with stats system
- ✅ Can optimize for performance

**Cons:**
- ❌ More development time
- ❌ Need to implement validation logic
- ❌ Need to test extensively
- ❌ Multi-PV analysis not native (simulate with multiple evals)

---

## Integration with Classical League

### Data Flow

```
Round PGN (via API or file)
    ↓
stats generation (existing)
    ↓
puzzle generation (new)
    ↓
Save to stats JSON
    ↓
Display on stats page
```

### Modified Stats JSON Structure

Add puzzle data to existing round stats:

```json
{
  "season": 2,
  "round": 1,
  "generated": "2025-01-15T12:00:00Z",

  "overview": { /* existing */ },
  "games": [ /* existing */ ],
  "openings": { /* existing */ },

  "puzzleOfTheRound": {
    "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 6",
    "moves": ["Bxf7+", "Kxf7", "Ng5+", "Kg8", "Qf3"],
    "solution": "1. Bxf7+! Kxf7 2. Ng5+ Kg8 3. Qf3 with winning attack",
    "category": "sacrifice",
    "themes": ["sacrifice", "exposed_king", "discovered_attack"],
    "difficulty": "intermediate",
    "estimatedRating": 1650,

    "context": {
      "gameId": "season-2-round-1-board-3",
      "white": "PlayerA",
      "black": "PlayerB",
      "moveNumber": 11,
      "gameUrl": "https://lichess.org/broadcast/...",
      "description": "White sacrifices the bishop to expose Black's king"
    },

    "evaluation": {
      "beforeBlunder": 0.5,
      "afterBlunder": -1.2,
      "afterSolution": 3.5
    }
  }
}
```

### UI Component

Create new stats section:

```typescript
// components/stats/puzzle-of-round.tsx

'use client';

import { useState } from 'react';
import { StatCard } from './stat-card';

interface PuzzleOfRoundProps {
  puzzle: {
    fen: string;
    moves: string[];
    solution: string;
    category: string;
    themes: string[];
    difficulty: string;
    context: {
      white: string;
      black: string;
      moveNumber: number;
      description: string;
    };
  };
}

export function PuzzleOfRound({ puzzle }: PuzzleOfRoundProps) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <StatCard
      title="🧩 Puzzle of the Round"
      description={puzzle.context.description}
    >
      <div className="space-y-4">
        {/* Chess Board Visualization */}
        <div className="aspect-square max-w-md mx-auto bg-slate-100 dark:bg-slate-800 rounded-lg">
          {/* Render chess position from FEN */}
          <ChessBoard fen={puzzle.fen} />
        </div>

        {/* Puzzle Info */}
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            From {puzzle.context.white} vs {puzzle.context.black}
          </p>

          <div className="flex justify-center gap-2">
            {puzzle.themes.map(theme => (
              <span
                key={theme}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 rounded"
              >
                {theme}
              </span>
            ))}
          </div>

          <p className="text-sm">
            Difficulty: <span className="font-semibold">{puzzle.difficulty}</span>
          </p>
        </div>

        {/* Solution Toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </button>

          {showSolution && (
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded">
              <p className="font-mono text-sm">{puzzle.solution}</p>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Moves: {puzzle.moves.join(' → ')}
              </div>
            </div>
          )}
        </div>

        {/* Try on Lichess */}
        <div className="text-center">
          <a
            href={`https://lichess.org/analysis/${puzzle.fen}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Analyze on Lichess →
          </a>
        </div>
      </div>
    </StatCard>
  );
}

// Simple board visualization (or use a library like react-chessboard)
function ChessBoard({ fen }: { fen: string }) {
  // Parse FEN and render board
  // Could use: npm install react-chessboard
  return (
    <div className="w-full h-full flex items-center justify-center">
      <p className="text-slate-400">Chess board renders here</p>
      <p className="text-xs text-slate-500 mt-2 font-mono">{fen}</p>
    </div>
  );
}
```

### Modified Generation Script

Update `scripts/generate-stats.js`:

```javascript
// scripts/generate-stats.js

const { parseMultipleGames } = require('./utils/pgn-parser');
const { calculateStats } = require('./utils/stats-calculator');
const { PuzzleGenerator } = require('./utils/puzzle-generator'); // NEW

async function main() {
  // ... existing code ...

  // Parse PGN
  const games = parseMultipleGames(pgnData);

  // Calculate existing stats
  const stats = await calculateStats(games, options);

  // NEW: Generate puzzle
  console.log('\n🧩 Generating Puzzle of the Round...');
  const puzzleGenerator = new PuzzleGenerator();

  const candidates = await puzzleGenerator.findCandidates(games);

  let bestPuzzle = null;
  for (const candidate of candidates) {
    const puzzle = await puzzleGenerator.generatePuzzle(candidate);
    if (puzzle) {
      // Keep best puzzle (highest interest score)
      if (!bestPuzzle || calculateInterestScore(puzzle) > calculateInterestScore(bestPuzzle)) {
        bestPuzzle = puzzle;
      }
    }
  }

  puzzleGenerator.quit();

  // Add to stats
  if (bestPuzzle) {
    stats.puzzleOfTheRound = formatPuzzleForOutput(bestPuzzle, games);
    console.log('✅ Puzzle generated successfully!');
  } else {
    console.log('⚠️  No suitable puzzle found this round');
    stats.puzzleOfTheRound = null;
  }

  // ... save stats JSON ...
}
```

### Display in Stats Page

Update round stats page:

```typescript
// app/stats/round/[roundNumber]/page.tsx

import { PuzzleOfRound } from '@/components/stats/puzzle-of-round';

export default async function RoundStatsPage({ params }) {
  const stats = await loadRoundStats(params.roundNumber);

  return (
    <div className="space-y-8">
      <RoundHeader round={stats.round} season={stats.season} />
      <OverviewStats data={stats.overview} />

      {/* NEW: Puzzle section */}
      {stats.puzzleOfTheRound && (
        <PuzzleOfRound puzzle={stats.puzzleOfTheRound} />
      )}

      <ResultsBreakdown data={stats.results} />
      {/* ... rest of stats ... */}
    </div>
  );
}
```

---

## Performance Considerations

### Optimization Strategies

#### 1. Parallel Processing
```javascript
// Process multiple games in parallel
const puzzlePromises = candidates.map(c => puzzleGenerator.generatePuzzle(c));
const puzzles = await Promise.all(puzzlePromises);
```

#### 2. Depth Tuning
```javascript
// Adjust depth based on available time
const QUICK_MODE = { scan: 12, search: 18 };  // ~5 min for 30 games
const NORMAL_MODE = { scan: 16, search: 22 }; // ~15 min for 30 games
const DEEP_MODE = { scan: 20, search: 26 };   // ~45 min for 30 games
```

#### 3. Candidate Filtering
```javascript
// Limit candidates to reduce processing time
const MAX_CANDIDATES = 10;
const topCandidates = candidates
  .sort((a, b) => evalSwingScore(b) - evalSwingScore(a))
  .slice(0, MAX_CANDIDATES);
```

#### 4. Caching
```javascript
// Cache position evaluations during scanning
const evalCache = new Map();

async function cachedEval(fen) {
  if (evalCache.has(fen)) return evalCache.get(fen);
  const eval = await evaluator.evaluatePosition(fen);
  evalCache.set(fen, eval);
  return eval;
}
```

### Expected Performance

| Configuration | Time (30 games) | Puzzle Quality |
|--------------|-----------------|----------------|
| Quick (depth 12/18) | ~5 minutes | Good |
| Normal (depth 16/22) | ~15 minutes | Very Good |
| Deep (depth 20/26) | ~45 minutes | Excellent |

**Recommendation:** Use Normal mode for GitHub Actions weekly workflow.

---

## Next Steps

### Phase 1: Prototype (1-2 days)

1. ✅ Research complete (this document)
2. ⏳ Set up Python bridge
   - Clone linrock/chess-puzzle-maker
   - Install dependencies
   - Test with sample PGN
3. ⏳ Create basic Node.js wrapper
   - `scripts/generate-puzzles.js`
   - Parse puzzle PGN output
   - Select best puzzle
4. ⏳ Integrate with stats system
   - Add to `generate-stats.js`
   - Update JSON structure
5. ⏳ Create basic UI component
   - Display FEN position
   - Show solution on click
   - Link to Lichess analysis

### Phase 2: Production (1 week)

1. ⏳ Build native Node.js generator
   - Implement `PuzzleGenerator` class
   - Port detection algorithm
   - Add validation logic
2. ⏳ Add puzzle categorization
   - Theme detection (fork, pin, etc.)
   - Difficulty estimation
   - Interest scoring
3. ⏳ Enhance UI
   - Interactive chess board
   - Better solution reveal
   - Difficulty indicator
4. ⏳ Performance optimization
   - Parallel candidate processing
   - Evaluation caching
   - Depth tuning

### Phase 3: Enhancement (Ongoing)

1. ⏳ Multiple puzzles per round
   - "Easy", "Medium", "Hard"
   - Different tactical themes
2. ⏳ Player-specific puzzles
   - "Your best move"
   - "Your critical mistake"
3. ⏳ Puzzle solving tracking
   - Record attempts
   - Display statistics
   - Leaderboard
4. ⏳ Season puzzle collection
   - "Best Puzzles of Season"
   - Difficulty progression
   - Theme variety

---

## Appendix A: Code References

### Key Files to Create

```
scripts/
├── generate-puzzles.js          # Main puzzle generation script
└── utils/
    └── puzzle-generator.js      # PuzzleGenerator class

components/stats/
└── puzzle-of-round.tsx          # UI component

scripts/python-bridge/           # Phase 1 only
└── chess-puzzle-maker/          # Git submodule
```

### Modified Files

```
scripts/
└── generate-stats.js            # Add puzzle generation call

app/stats/round/[roundNumber]/
└── page.tsx                     # Display puzzle section

package.json                     # Add scripts if needed
```

---

## Appendix B: Alternative Approaches

### 1. Lichess Puzzle Database

Instead of generating puzzles, query existing Lichess puzzle DB:

```javascript
// Query puzzles by opening or position
const response = await fetch('https://lichess.org/api/puzzle/daily');
const puzzle = await response.json();
```

**Pros:**
- ✅ No generation needed
- ✅ Pre-rated puzzles
- ✅ Instant results

**Cons:**
- ❌ Not from your actual games
- ❌ Less personal/relevant
- ❌ External API dependency

### 2. Manual Curation

Admin selects puzzle manually each round:

**Pros:**
- ✅ Guaranteed quality
- ✅ Can add context/story
- ✅ No automation complexity

**Cons:**
- ❌ Time-consuming
- ❌ Requires chess expertise
- ❌ Not scalable

### 3. Hybrid: Generate + Manual Selection

Generate candidates, admin picks best:

```typescript
// Admin panel: Review puzzle candidates
<PuzzleCandidateList
  candidates={generatedPuzzles}
  onSelect={selectPuzzleOfTheRound}
/>
```

**Pros:**
- ✅ Best of both worlds
- ✅ Quality control
- ✅ Automated heavy lifting

**Cons:**
- ❌ Still requires manual work
- ❌ Can't be fully automated

---

## Appendix C: Resources

### Documentation
- UCI Protocol: https://www.chessprogramming.org/UCI
- FEN Notation: https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
- PGN Specification: https://ia902908.us.archive.org/26/items/pgn-standard-1994-03-12/PGN_standard_1994-03-12.txt

### Libraries
- chess.js docs: https://github.com/jhlywa/chess.js
- stockfish.js: https://www.npmjs.com/package/stockfish
- react-chessboard: https://www.npmjs.com/package/react-chessboard

### Repositories
- linrock/chess-puzzle-maker: https://github.com/linrock/chess-puzzle-maker
- vitogit/pgn-tactics-generator: https://github.com/vitogit/pgn-tactics-generator
- ornicar/lichess-puzzler: https://github.com/ornicar/lichess-puzzler

### Chess Programming
- Chess Programming Wiki: https://www.chessprogramming.org/
- Stockfish source: https://github.com/official-stockfish/Stockfish
- Lichess source: https://github.com/lichess-org/

---

## Summary

**Automatic puzzle generation is feasible for Classical League!**

### Key Takeaways

1. **Algorithm is proven** - Multiple open-source implementations exist
2. **Your infrastructure is ready** - Stockfish and chess.js already installed
3. **Two viable paths**:
   - Quick: Python bridge (1-2 days)
   - Native: Node.js implementation (1-2 weeks)
4. **Integration is straightforward** - Extends existing stats system
5. **Performance is acceptable** - 15-30 minutes per round generation

### Recommended Action

**Start with Phase 1 (Python bridge)** to validate concept and user interest, then migrate to Phase 2 (native implementation) if successful.

This approach minimizes risk while delivering value quickly.

---

**Questions or need clarification? I can:**
- Provide more code examples for specific components
- Detail the theme detection algorithm
- Help set up the Python bridge
- Design the database schema for puzzle tracking
- Create the full UI specification

Let me know how you'd like to proceed!
