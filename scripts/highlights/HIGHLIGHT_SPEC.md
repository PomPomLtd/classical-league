# Player Highlight Generator Specification

## Overview

Generate 1-2 "highlight" positions for each player who played at least 3 games in the tournament. These positions should showcase memorable moments from their games - brilliant moves, dramatic blunders, tactical shots, or interesting situations that excite chess players.

## Input

- **Source**: `all-games.pgn` (downloaded from Lichess broadcast)
- **Tournament**: K4 Classical League Season 2
- **Rounds**: 7 total
- **Max games per player**: 7

## Output

Per-player highlight data including:
- Player name and nickname
- 1-2 highlighted positions with:
  - FEN position
  - Move played (and best move if different)
  - Highlight type/category
  - Context (round, opponent, result)
  - Brief description of why this is interesting

---

## Position Priority List

Since players have max 7 games, we need a fallback hierarchy to guarantee finding at least 1 highlight per player. Search in this order:

### Tier 1: Rare & Spectacular (Check first - these make the best highlights)

**1. Queen Sacrifices**
- Intentional queen sacrifice leading to advantage or mate
- Detection: Queen captured/traded where eval stays equal or improves
- Why: Always visually stunning, rare at club level

**2. Checkmate Patterns**
- Back rank mate
- Smothered mate
- Sacrifice-into-mate combinations
- Detection: Game ends in mate, analyze final 3-5 moves
- Why: Ultimate goal of chess, satisfying conclusion

**3. Underpromotion**
- Promotion to knight, bishop, or rook instead of queen
- Detection: Promotion move that isn't `=Q`
- Why: Extremely rare, shows deep calculation

### Tier 2: Dramatic Moments (High entertainment value)

**4. Brilliant Moves**
- Unexpected strong move, often a sacrifice
- Detection: Move that looks bad (material loss) but eval is equal or better
- Criteria: Piece sacrifice where eval swing is < 1.0 (not a blunder)
- Why: Shows calculation and creativity

**5. Comeback Kings**
- Winning from a losing position (eval swing > 3.0 in their favor during game)
- Detection: Position where player was losing by 3+ pawns, ended up winning
- Why: Shows fighting spirit, dramatic narrative

**6. Horrible Blunders**
- Catastrophic mistakes that swing the game
- Detection: Centipawn loss > 300 (3+ pawns worth)
- Bonus: Hanging queen, missing mate-in-1, stalemate when winning
- Why: Relatable, educational, often memorable for the wrong reasons

**7. Lucky Escapes**
- Opponent blundered in a winning position
- Detection: Opponent had eval > 3.0, game ended in draw or loss for opponent
- Why: Everyone loves a lucky break story

### Tier 3: Tactical Highlights (Solid chess content)

**8. Double Attacks / Forks**
- Knight forks (especially royal forks: K+Q)
- Queen forks winning material
- Detection: Piece attacks 2+ enemy pieces, material gained next move
- Why: Classic tactical motif, satisfying

**9. Discovered Attacks**
- Moving piece reveals attack from piece behind
- Detection: Move that creates attack from a piece that didn't move
- Why: Elegant tactical pattern

**10. Pins & Skewers**
- Pin: Piece can't move because it exposes more valuable piece
- Skewer: Valuable piece moves, piece behind captured
- Detection: Analyze piece alignment on ranks/files/diagonals
- Why: Fundamental tactics, often game-deciding

**11. Trapped Pieces**
- Piece (especially queen/rook) gets trapped and lost
- Detection: High-value piece captured with no compensation, piece had no legal moves
- Why: Dramatic material swing

### Tier 4: Interesting Situations (Fallback options)

**12. En Passant**
- Any en passant capture
- Bonus: En passant that wins material or is only good move
- Detection: Move notation contains "e.p." or pawn capture to empty square
- Why: Special rule, always worth noting

**13. Long Castling Drama**
- Queenside castling in sharp position
- Detection: O-O-O move, especially if followed by attack
- Why: Bold decision, often leads to opposite-side castling attacks

**14. Pawn Promotion Races**
- Both sides pushing passed pawns
- Detection: Position with advanced passed pawns for both sides
- Why: Tense, easy to visualize

**15. Longest Game**
- Player's game with most moves
- Detection: Move count
- Why: Shows stamina, often has interesting endgames

### Tier 5: Guaranteed Fallbacks (If nothing else found)

**16. Best Winning Attack**
- Position where player had the best attack leading to win
- Detection: Highest eval swing in their favor during a won game
- Why: Everyone likes seeing an attack

**17. Critical Moment**
- Position with most tension (many pieces attacking/defending)
- Detection: Highest number of attacked squares/pieces
- Why: Visually complex, represents the battle

**18. Opening Surprise**
- Unusual opening choice or early deviation
- Detection: ECO code analysis, deviation from main lines
- Why: Shows personality, preparation

---

## Detection Requirements

### Stockfish Analysis Needed For:
- Centipawn loss calculation (blunders, brilliant moves)
- Evaluation swings (comebacks, escapes)
- Best move comparison (sacrifices, mistakes)
- Mate-in-N detection

### Pattern Matching Needed For:
- Checkmate patterns (back rank, smothered)
- Tactical motifs (forks, pins, discovered attacks)
- Special moves (en passant, underpromotion, castling)
- Piece trapping

### Simple Detection:
- Move count (longest game)
- Promotion type
- Castling type
- Game result

---

## Technical Implementation

### Reusing Existing Infrastructure

The codebase already has excellent tools we should leverage:

**From `scripts/utils/pgn-parser.js`:**
- `parseMultipleGames()` - Parse PGN into structured game objects
- `generatePositions()` - Generate FEN for each position in a game
- `analyzeSpecialMoves()` - Detects captures, en passant, castling, promotions, checks

**From `scripts/analyze-pgn.py`:**
- Full Stockfish analysis with python-chess + stockfish library
- Win percentage calculation using Lichess formula
- Move classification: `blunders`, `mistakes`, `inaccuracies`, `good`, `excellent`
- `biggestBlunder` detection with severity scoring
- `biggestComeback` detection (eval swing > 600cp)
- `luckyEscape` detection (opponent didn't punish blunder)
- ACPL (Average Centipawn Loss) calculation

**From `scripts/utils/stockfish-evaluator.js`:**
- Node.js WASM Stockfish (nmrugg/stockfish.js)
- `evaluatePosition(fen)` - Returns score, mate, bestMove
- `calculateCentipawnLoss()` - Centipawn loss between positions
- `classifyMoveQuality()` - Classify by cp loss

**From fun-stats calculators (`scripts/utils/calculators/fun-stats/`):**
- Pattern detection examples for capture sequences, check sequences, castling, etc.
- Helper utilities for player name extraction

### Architecture Decision: Python vs Node.js

**Recommendation: Use Python (analyze-pgn.py approach)**

Reasons:
1. `python-chess` is the most mature chess library with native Stockfish UCI support
2. Lichess puzzler uses Python - battle-tested patterns available
3. Existing `analyze-pgn.py` already has 80% of the logic we need
4. Native Stockfish (not WASM) is 2x faster - important for ~200 games
5. Can extend existing script rather than building from scratch

### Key Detection Algorithms

**1. Brilliant Move Detection (based on Lichess research)**
```python
def is_brilliant_move(eval_before, eval_after, move, best_move):
    """
    Criteria for brilliant moves:
    1. Move is a sacrifice (loses material)
    2. Move is the best move (or within 50cp of best)
    3. Win% doesn't decrease (sacrifice works)
    4. Position wasn't already completely winning
    """
    is_sacrifice = move_loses_material(move)
    is_best = move == best_move or abs(eval_diff) < 50
    win_maintained = win_pct_after >= win_pct_before - 2
    not_crushing = abs(eval_before) < 500

    return is_sacrifice and is_best and win_maintained and not_crushing
```

**2. Tactical Motif Detection (based on Lichess puzzler)**
```python
def detect_fork(board, move):
    """
    Fork detection:
    1. Piece moves to square attacking 2+ valuable pieces
    2. Destination square is safe
    3. Attacked pieces are more valuable than attacker
    """
    piece = board.piece_at(move.to_square)
    attacked = get_attacked_pieces(board, move.to_square, piece.color)
    valuable_attacked = [p for p in attacked if piece_value(p) >= piece_value(piece)]
    return len(valuable_attacked) >= 2
```

**3. Checkmate Pattern Detection**
```python
def classify_checkmate(board):
    """
    Detect checkmate patterns:
    - Back rank mate: King on 1st/8th rank, mated by rook/queen
    - Smothered mate: King surrounded by own pieces, mated by knight
    - Anastasia's mate, Arabian mate, etc.
    """
    king_square = board.king(not board.turn)
    # Analyze king position and mating piece
```

**4. Win Percentage Formula (Lichess)**
```python
def cp_to_win_pct(cp):
    """Convert centipawns to win percentage (0-100)"""
    return 50 + 50 * (2 / (1 + 10 ** (-abs(cp) / 400)) - 1) * (-1 if cp < 0 else 1)
```

### Thresholds (based on Lichess + existing codebase)

| Classification | Win% Loss | Centipawn Loss |
|---------------|-----------|----------------|
| Excellent     | < 2%      | < 20 cp        |
| Good          | 2-5%      | 20-50 cp       |
| Inaccuracy    | 5-10%    | 50-100 cp      |
| Mistake       | 10-20%    | 100-200 cp     |
| Blunder       | > 20%     | > 200 cp       |

### Highlight Priority Scoring

Each potential highlight gets a score based on:
```python
score = base_priority_score  # From tier (1-5)
score += rarity_bonus        # How rare is this pattern?
score += drama_bonus         # Eval swing, material swing
score += visual_appeal       # Queen sac > pawn sac
score -= already_selected    # Avoid duplicates for same player
```

---

## Implementation Phases

### Phase 1: Data Extraction
- Parse `all-games.pgn` using existing `pgn-parser.js` patterns
- Group games by player (both white and black)
- Filter players with < 3 games
- Generate FEN positions for each game

### Phase 2: Stockfish Analysis (extend analyze-pgn.py)
- Analyze each game with Stockfish depth 15 (configurable)
- Store eval + best move for each position
- Calculate win% loss per move
- Detect: blunders, brilliant moves, comebacks, lucky escapes

### Phase 3: Pattern Detection
- Tactical motifs: forks, pins, skewers, discovered attacks
- Checkmate patterns: back rank, smothered, etc.
- Special moves: en passant, underpromotion
- Piece traps: trapped queen/rook

### Phase 4: Highlight Selection
- For each player, collect all candidate highlights
- Score each candidate using priority + bonus system
- Select top 1-3 highlights (prefer variety in types)

### Phase 5: Output Generation
- Generate final JSON with FEN, move, description
- Include game context (round, opponent, result)
- Add Lichess study link for each position

---

## Design Decisions

1. **Analysis scope**: Analyze EVERY move with Stockfish (thorough)

2. **Stockfish depth**: Default 15, configurable via `--depth` CLI flag

3. **Highlight count**: Show 1-3 highlights per player. Only show 2-3 if they are genuinely interesting.

4. **Highlight preference**: Prefer positive highlights (brilliant moves, tactics, wins), but blunders are fine too - they can be funny and relatable!

5. **Output format**: Single JSON file (`highlights.json`) with all players for easy frontend consumption

---

## Output JSON Structure

```json
{
  "generated": "2025-01-08T12:00:00Z",
  "season": 2,
  "playerCount": 35,
  "players": [
    {
      "name": "Manuel «Grundpatzer» C.",
      "card": {
        "gamesPlayed": 5,
        "gamesAsWhite": 3,
        "gamesAsBlack": 2,
        "wins": 3,
        "losses": 1,
        "draws": 1,
        "winRate": 60.0,
        "totalMoves": 245,
        "avgGameLength": 49,
        "longestGame": { "moves": 67, "opponent": "Player X", "round": 3 },
        "shortestGame": { "moves": 28, "opponent": "Player Y", "round": 1 },
        "accuracy": {
          "overall": 78.5,
          "asWhite": 82.3,
          "asBlack": 74.7
        },
        "moveQuality": {
          "excellent": 120,
          "good": 85,
          "inaccuracies": 25,
          "mistakes": 12,
          "blunders": 3
        },
        "avgCentipawnLoss": 35.2,
        "favoriteOpening": {
          "white": { "name": "Italian Game", "eco": "C54", "count": 2 },
          "black": { "name": "Sicilian Defense", "eco": "B90", "count": 2 }
        },
        "tactics": {
          "totalCaptures": 42,
          "checksGiven": 15,
          "checkmates": 2,
          "castledKingside": 4,
          "castledQueenside": 0
        }
      },
      "highlights": [
        {
          "type": "brilliant_move",
          "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
          "move": "Qxf7#",
          "bestMove": "Qxf7#",
          "evaluation": "#1",
          "evalBefore": "+2.5",
          "description": "Scholar's mate! Quick victory in round 1.",
          "round": 1,
          "opponent": "Adam «PawnRuinerAlpha» A.",
          "color": "white",
          "result": "1-0",
          "moveNumber": 4,
          "gameUrl": "https://lichess.org/broadcast/..."
        }
      ]
    }
  ]
}
```

### Player Card Stats

Each player card includes:

**Game Stats:**
- Games played (total, as white, as black)
- Win/Loss/Draw record and win rate
- Longest and shortest games

**Move Quality (from Stockfish analysis):**
- Overall accuracy percentage
- Accuracy as white vs black
- Move classification counts (excellent/good/inaccuracy/mistake/blunder)
- Average centipawn loss (ACPL)

**Opening Preferences:**
- Most played opening as white
- Most played opening as black

**Tactical Stats:**
- Total captures made
- Checks given
- Checkmates delivered
- Castling preferences

---

## CLI Interface

```bash
# Full analysis (production)
node scripts/highlights/generate-highlights.js --depth 15

# Quick test (development)
node scripts/highlights/generate-highlights.js --depth 10 --limit 5

# Options:
#   --depth <n>     Stockfish depth (default: 15)
#   --limit <n>     Only analyze first N players (for testing)
#   --player <name> Analyze specific player only
#   --verbose       Show detailed progress
```

---

## References & Research Sources

### Lichess Puzzle Generation
- **lichess-puzzler**: https://github.com/ornicar/lichess-puzzler
  - Scans games for large evaluation swings
  - 40+ tactical pattern detectors (forks, pins, sacrifices, etc.)
  - Uses python-chess + Stockfish at 40 meganodes
  - Processed 300M+ games for Lichess puzzle database

- **Puzzle Tagging System**: https://deepwiki.com/ornicar/lichess-puzzler/3-puzzle-tagging-system
  - Detailed classification thresholds
  - Pattern detection algorithms

### Chess Libraries
- **python-chess**: https://github.com/niklasf/python-chess
  - Most mature Python chess library
  - Native Stockfish UCI integration
  - Built-in pin/attack detection methods

- **chess.js**: https://github.com/jhlywa/chess.js
  - JavaScript move validation and PGN parsing
  - Used in existing `pgn-parser.js`

- **stockfish.js**: https://github.com/nmrugg/stockfish.js
  - Stockfish 17.1 compiled to WebAssembly
  - Used in existing `stockfish-evaluator.js`

### Accuracy & Win Percentage
- **Lichess Accuracy Formula**: https://lichess.org/page/accuracy
  - `accuracy = 103.1668 * e^(-0.04354 * avg_win_loss) - 3.1669`
  - Win% = `50 + 50 * (2 / (1 + 10^(-cp/400)) - 1)`

### Alternative Tools Considered
- **chess-puzzle-maker**: https://github.com/linrock/chess-puzzle-maker
- **node-uci**: https://github.com/ebemunk/node-uci (native Stockfish for Node.js)
- **lichess-org/stockfish.wasm**: https://github.com/lichess-org/stockfish.wasm

### Existing Codebase Infrastructure
- `scripts/analyze-pgn.py` - Full Stockfish analysis (extend this)
- `scripts/utils/pgn-parser.js` - PGN parsing
- `scripts/utils/stockfish-evaluator.js` - Node.js WASM Stockfish
- `scripts/utils/calculators/fun-stats/` - 21 pattern detectors
