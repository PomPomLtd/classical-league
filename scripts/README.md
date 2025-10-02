# Stats Generation Scripts

## Quick Start

Generate stats for Round 1:
```bash
node scripts/generate-stats.js --round 1
```

The script will:
1. Load PGN data from `/tmp/round1-fresh.pgn`
2. Parse all games (18/18 successfully)
3. Calculate comprehensive statistics
4. Save JSON to `public/stats/season-2-round-1.json`

## Usage

```bash
node scripts/generate-stats.js --round <number> [--season <number>]
```

**Options:**
- `--round, -r <number>` - Round number (required)
- `--season, -s <number>` - Season number (default: 2)
- `--help, -h` - Show help

**Examples:**
```bash
# Generate stats for Round 1
node scripts/generate-stats.js --round 1

# Generate stats for Round 2, Season 2
node scripts/generate-stats.js --round 2 --season 2
```

## Output

Generated JSON file contains:
- **Overview**: Total games, moves, longest/shortest games
- **Game Phases**: Opening/middlegame/endgame lengths
- **Results**: Win/loss/draw percentages  
- **Openings**: Popular first moves and sequences
- **Tactics**: Captures, castling, promotions, en passant
- **Pieces**: Activity, captures, survival rates
- **Checkmates**: By piece type, fastest mate
- **Awards**: Bloodbath, pacifist, speed demon, endgame wizard, etc.

## Files Created

- `public/stats/season-2-round-1.json` - Round 1 statistics
- Future: `public/stats/season-2-overall.json` - Aggregated season stats

## Current Limitations

- PGN data must be downloaded to `/tmp/round1-fresh.pgn` first
- TODO: Integrate with API endpoint `/api/broadcast/round/{roundId}/pgn`
- TODO: Generate overall season stats (combining all rounds)

## Next Steps (Phase 2)

Once stats are generated, we'll build UI pages:
- `/stats` - Overall season statistics
- `/stats/round/1` - Round 1 specific stats
- `/stats/round/2` - Round 2 specific stats
- etc.
