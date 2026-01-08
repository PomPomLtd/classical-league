# Player Highlight Generator Specification

## Status: ✅ IMPLEMENTED

All phases complete. Script ready for production use.

## Overview

Generate 1-3 "highlight" positions for each player who played at least 3 games in the tournament. Each player also gets a **Player Card** with comprehensive statistics. Highlights showcase memorable moments - brilliant moves, dramatic blunders, tactical shots, checkmates, or interesting situations.

## Quick Start

```bash
# Full production run (69 players, ~78 minutes)
venv/bin/python scripts/highlights/generate-highlights.py --depth 15

# Quick test (single player)
venv/bin/python scripts/highlights/generate-highlights.py --player "Manuel" --depth 10

# Test with player limit
venv/bin/python scripts/highlights/generate-highlights.py --limit 5 --depth 10
```

## Input

- **Source**: `scripts/highlights/all-games.pgn` (from Lichess broadcast)
- **Broadcast URL**: https://lichess.org/api/broadcast/LVSkiDuJ.pgn
- **Tournament**: K4 Classical League Season 2
- **Rounds**: 7 total
- **Games**: 213 total
- **Moves**: 15,690 total
- **Players**: 77 unique (69 with 3+ games)

## Output

**File**: `public/stats/season-2-highlights.json`

---

## Implementation Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | PGN parsing & player grouping | ✅ Complete |
| 2 | Stockfish analysis & player cards | ✅ Complete |
| 3 | Pattern detection (8 highlight types) | ✅ Complete |
| 4 | Highlight selection (1-3 per player) | ✅ Complete |
| 5 | JSON output generation | ✅ Complete |

---

## Highlight Types Detected

### Tier 1: Rare & Spectacular (Priority 1)

| Type | Detection | Score |
|------|-----------|-------|
| `checkmate` | Mate in 1 after move | 100 |
| `brilliant_sacrifice` | Material balance -2+ but eval maintained (Lichess algorithm) | 90-110 |
| `underpromotion` | Promote to N/B/R instead of Q | 95 |

### Tier 2: Dramatic Moments (Priority 2)

| Type | Detection | Score |
|------|-----------|-------|
| `brilliant_move` | Excellent move + eval swing >150cp | 70-100 |
| `blunder` | 200+ cp loss, severity scoring | 60-100 |
| `comeback` | 500+ cp swing recovery | 65-100 |

### Tier 3: Tactical Highlights (Priority 3)

| Type | Detection | Score |
|------|-----------|-------|
| `tactical_check` | Check + eval swing >100cp | 50-80 |

### Tier 4: Special Moves (Priority 4)

| Type | Detection | Score |
|------|-----------|-------|
| `en_passant` | En passant capture | 40 |

---

## Sacrifice Detection (Lichess Algorithm)

Based on [lichess-puzzler](https://github.com/ornicar/lichess-puzzler) `cook.py`:

```python
# A sacrifice is when YOUR material balance decreases by 2+ points
def is_sacrifice(fen_before, fen_after, player_color):
    def material_diff(board, color):
        values = {PAWN: 1, KNIGHT: 3, BISHOP: 3, ROOK: 5, QUEEN: 9}
        yours = sum(len(board.pieces(pt, color)) * v for pt, v in values.items())
        theirs = sum(len(board.pieces(pt, not color)) * v for pt, v in values.items())
        return yours - theirs

    diff_before = material_diff(Board(fen_before), player_color)
    diff_after = material_diff(Board(fen_after), player_color)
    material_loss = diff_before - diff_after

    return material_loss >= 2  # Exchange sacrifice or bigger
```

**Why this works:**
- Scandinavian `Qxd5` (recapture): material_diff stays 0 → NOT a sacrifice
- Real exchange sac: material_diff drops by 2+ → IS a sacrifice

---

## Player Card Statistics

Each player gets a comprehensive stats card:

### Game Stats
- `gamesPlayed`, `gamesAsWhite`, `gamesAsBlack`
- `wins`, `losses`, `draws`, `winRate`
- `longestGame`, `shortestGame` (with opponent, round, result)

### Move Quality (Stockfish)
- `accuracy.overall`, `accuracy.asWhite`, `accuracy.asBlack`
- `moveQuality.excellent/good/inaccuracies/mistakes/blunders`
- `avgCentipawnLoss`

### Opening Preferences
- `favoriteOpening.white` (ECO, name, count)
- `favoriteOpening.black` (ECO, name, count)

### Tactical Stats
- `totalCaptures`, `checksGiven`, `checkmates`
- `castledKingside`, `castledQueenside`

---

## Output JSON Structure

```json
{
  "generated": "2025-01-08T12:00:00Z",
  "season": 2,
  "status": "complete",
  "playerCount": 69,
  "totalGames": 213,
  "totalMoves": 15690,
  "analysisStats": {
    "gamesAnalyzed": 213,
    "movesAnalyzed": 15690,
    "excellentMoves": 8500,
    "mistakes": 1200,
    "blunders": 800,
    "depth": 15
  },
  "highlightStats": {
    "totalCandidates": 1500,
    "totalSelected": 180,
    "byType": {
      "checkmate": 45,
      "blunder": 120,
      "brilliant_move": 30,
      ...
    }
  },
  "players": [
    {
      "name": "Manuel «Grundpatzer» C.",
      "card": {
        "gamesPlayed": 7,
        "gamesAsWhite": 4,
        "gamesAsBlack": 3,
        "wins": 4,
        "losses": 2,
        "draws": 1,
        "winRate": 57.1,
        "totalMoves": 280,
        "avgGameLength": 40.0,
        "longestGame": {
          "moves": 67,
          "opponent": "Player X",
          "round": "3",
          "result": "1-0"
        },
        "shortestGame": {
          "moves": 28,
          "opponent": "Player Y",
          "round": "1",
          "result": "0-1"
        },
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
          "type": "checkmate",
          "priority": 1,
          "score": 100.0,
          "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
          "move": "Qxf7#",
          "moveUci": "h5f7",
          "bestMove": "Qxf7#",
          "evalBefore": "+2.5",
          "evalAfter": "M1",
          "description": "Checkmate! Qxf7# ends the game.",
          "moveNumber": 4,
          "color": "white",
          "opponent": "Adam «PawnRuinerAlpha» A.",
          "round": "1",
          "result": "1-0",
          "gameUrl": "https://lichess.org/broadcast/k4-classical-league-season-2/round-1/xxx/yyy"
        }
      ]
    }
  ]
}
```

---

## CLI Interface

```bash
venv/bin/python scripts/highlights/generate-highlights.py [OPTIONS]

Options:
  --depth <n>         Stockfish search depth (default: 15)
  --limit <n>         Only analyze first N players (for testing)
  --min-games <n>     Minimum games per player (default: 3)
  --player <name>     Analyze specific player only (partial match)
  --stockfish-path    Path to Stockfish binary (default: /opt/homebrew/bin/stockfish)
  --verbose, -v       Show detailed progress

Examples:
  # Production run
  venv/bin/python scripts/highlights/generate-highlights.py --depth 15

  # Test single player
  venv/bin/python scripts/highlights/generate-highlights.py --player "Nikola" --depth 10

  # Test first 5 players
  venv/bin/python scripts/highlights/generate-highlights.py --limit 5 --depth 10
```

---

## Performance

| Depth | Time per move | Total time (15,690 moves) |
|-------|---------------|---------------------------|
| 10 | ~0.15s | ~40 minutes |
| 15 | ~0.30s | ~78 minutes |
| 20 | ~0.60s | ~2.5 hours |

---

## Technical Stack

- **Language**: Python 3.x
- **Chess Library**: python-chess
- **Engine**: Stockfish (native binary via `stockfish` pip package)
- **PGN Source**: Lichess broadcast API

### Key Dependencies

```bash
pip install python-chess stockfish
brew install stockfish  # macOS
```

---

## References

### Lichess Puzzle Generation
- [lichess-puzzler](https://github.com/ornicar/lichess-puzzler) - Sacrifice detection algorithm
- [Puzzle Tagging System](https://deepwiki.com/ornicar/lichess-puzzler/3-puzzle-tagging-system) - Pattern detection

### Accuracy Formula (Lichess)
```python
# Win percentage from centipawns
win_pct = 50 + 50 * (2 / (1 + 10^(-cp/400)) - 1)

# Accuracy from average win% loss
accuracy = 103.1668 * e^(-0.04354 * avg_loss) - 3.1669
```

### Move Classification Thresholds

| Classification | Win% Loss | Centipawn Loss |
|---------------|-----------|----------------|
| Excellent | < 2% | < 20 cp |
| Good | 2-5% | 20-50 cp |
| Inaccuracy | 5-10% | 50-100 cp |
| Mistake | 10-20% | 100-200 cp |
| Blunder | > 20% | > 200 cp |

---

## Frontend Implementation

### Page Structure

```
/app/stats/highlights/
├── page.tsx                    # Player list with search
└── [playerSlug]/
    └── page.tsx                # Individual player page
```

### Routes

| Route | Description |
|-------|-------------|
| `/stats/highlights` | All players grid with search |
| `/stats/highlights/[playerSlug]` | Player detail with card + highlights |

### Components

```
/components/stats/highlights/
├── player-grid.tsx             # Grid of player cards
├── player-search.tsx           # Search input with filtering
├── player-card-preview.tsx     # Preview card for grid
├── player-stats-card.tsx       # Full stats card
├── highlight-position.tsx      # Single highlight with board
└── highlight-list.tsx          # List of highlights
```

### Player Slug Format

URL-safe player identifier:
```typescript
// "Manuel «Grundpatzer» C." → "manuel-grundpatzer-c"
function slugifyPlayer(name: string): string {
  return name
    .toLowerCase()
    .replace(/[«»]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
```

### Page: `/stats/highlights`

**Features:**
- Search field (filter by name/nickname)
- Grid of player cards (3 columns on desktop)
- Each card shows: name, accuracy, games, win rate
- Click → navigate to player detail

**Data Loading:**
```typescript
const response = await fetch('/stats/season-2-highlights.json')
const data = await response.json()
// data.players contains all player cards and highlights
```

### Page: `/stats/highlights/[playerSlug]`

**Features:**
- Back button to player list
- Player stats card (full version)
- Highlight positions with:
  - Chess board visualization (using FEN)
  - Move played + best move
  - Evaluation before/after
  - Description
  - Link to Lichess game

**Board Visualization Options:**
1. Simple: Link to Lichess analysis board
2. Embedded: Use `react-chessboard` or similar
3. Static: Generate board image from FEN

### Navigation Integration

Add to `components/navigation.tsx`:
```typescript
{ name: 'Player Highlights', href: '/stats/highlights' }
```

Or add link from `/stats/page.tsx` alongside Season Overview.

---

## Files

```
scripts/highlights/
├── HIGHLIGHT_SPEC.md           # This file
├── all-games.pgn               # Tournament PGN (213 games)
└── generate-highlights.py      # Main generator script

public/stats/
└── season-2-highlights.json    # Output file

app/stats/highlights/
├── page.tsx                    # Player list page
└── [playerSlug]/
    └── page.tsx                # Player detail page

components/stats/highlights/
├── player-grid.tsx
├── player-search.tsx
├── player-card-preview.tsx
├── player-stats-card.tsx
├── highlight-position.tsx
└── highlight-list.tsx
```
