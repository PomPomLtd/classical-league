# GitHub Actions Implementation Plan for Classical League

## Context and Requirements Analysis

### Tournament Structure

- **Format**: Swiss system, 7 rounds
- **Schedule**: Rounds every 2 weeks (14 days apart)
- **Season 2**: September 23, 2025 - December 15, 2025
- **Timing**: Rounds start on Tuesdays
- **Scale**: ~70 players, ~35 games per round
- **Bye Deadline**: Wednesday noon (4 days before round date)

### Round Schedule (Season 2)

```
Round 1: Sep 23 → Results due before Oct 7  (Round 2 start)
Round 2: Oct 7  → Results due before Oct 21 (Round 3 start)
Round 3: Oct 21 → Results due before Nov 4  (Round 4 start)
Round 4: Nov 4  → Results due before Nov 18 (Round 5 start)
Round 5: Nov 18 → Results due before Dec 2  (Round 6 start)
Round 6: Dec 2  → Results due before Dec 16 (Round 7 start)
Round 7: Dec 16 → Season ends
```

### Existing Infrastructure

**Database (PostgreSQL via Neon):**

- `Season` - Tournament seasons with `isActive` flag
- `Round` - Rounds with `roundNumber`, `roundDate`, `byeDeadline`
- `GameResult` - Game results with `boardNumber`, `result`, `pgn`, `isVerified`

**API Endpoints:**

- `GET /api/broadcast/rounds` - List all rounds with game counts
- `GET /api/broadcast/round/[roundId]/pgn` - Generate PGN from verified GameResults

**Statistics Scripts:**

- `/scripts/generate-stats.js` - Generate round statistics
  - Takes `--round <number>` and `--season <number>`
  - Accepts PGN via stdin
  - Optional `--analyze` flag for Stockfish analysis
  - Outputs to `public/stats/season-<N>-round-<N>.json`
- `/scripts/generate-overview.js` - Generate season overview
  - Takes `--season <number>`
  - Aggregates all round stats into hall of fame, leaderboards, trends
  - Outputs to `public/stats/season-<N>-overview.json`

**Analysis Tools:**

- Python venv with Stockfish integration
- `scripts/analyze-pgn.py` - Stockfish analysis (depth 15)
- `scripts/analyze-tactics.py` - Tactical pattern detection
- Execution time: ~5-10 minutes for 25 games with Stockfish

### PGN Generation Flow

1. Admin verifies GameResults in the database
2. PGN endpoint (`/api/broadcast/round/[roundId]/pgn`) queries verified results
3. PGN service generates combined PGN file
4. Workflow fetches PGN and pipes to stats script

---

## Workflow Strategy

### Timing Considerations

- **Wednesday at noon (12:00 UTC)**: Middle of round, 1 day before next round starts
- Players have had ~12 days to submit results
- Most games completed and verified by this time
- Allows for re-running on following Wednesday if needed

### Progressive Analysis Approach

Similar to Lichess 4545 stats, we'll implement:

1. **Bi-Weekly Round Analysis** (Wednesday noon)

   - Runs every 2 weeks on Wednesday at 12:00 UTC
   - Analyzes current/latest round with incomplete results
   - Uses Stockfish analysis (depth 15)
   - Re-runs automatically if more games added

2. **Season Overview Generation** (Wednesday 2pm)

   - Runs 2 hours after round analysis
   - Aggregates all completed rounds
   - Generates hall of fame and leaderboards
   - Fast execution (~5 seconds)

3. **Manual Workflows**
   - Single round analysis (on-demand)
   - Batch analysis for multiple rounds
   - Manual overview generation

---

## Implementation Plan

### Phase 1: Round Detection Logic

**Goal**: Determine which round to analyze automatically

**Approach**:

```javascript
// Pseudo-code for round detection
1. Query database for active season
2. Get all rounds ordered by roundDate
3. For each round:
   - Check current date vs roundDate
   - Count verified GameResults
   - Determine if round is "active" (started but not complete)
4. Select round to analyze:
   - If current round has incomplete results: analyze current round
   - If current round complete: analyze next round if it has results
   - Track expected game count (~25 games per round)
```

**Key Considerations**:

- **Expected games per round**: ~25 (can vary with byes and withdrawals)
- **Completion threshold**: 80% of expected games (20+ games)
- **Current round detection**: `roundDate <= today < roundDate + 14 days`

**API to Build** (optional but recommended):

```typescript
// GET /api/admin/stats/current-round
{
  roundId: string,
  roundNumber: number,
  gameCount: number,
  expectedGames: number,
  isComplete: boolean,
  shouldAnalyze: boolean
}
```

---

### Phase 2: Workflow Files

#### 2.1 Bi-Weekly Round Analysis

**File**: `.github/workflows/biweekly-analysis.yml`

**Schedule**: Every 2 weeks on Wednesday at 12:00 UTC

- First run: Wednesday after Round 1 start (Sep 25, 2025)
- Cron: `0 12 * * 3` (every Wednesday at noon)
- Manual filtering to run only on analysis weeks

**Steps**:

1. Checkout repository
2. Setup Node.js 20 with npm cache
3. Install dependencies (`npm ci`)
4. Setup Python 3.11 and install Stockfish
5. **Detect current round** (query API or database)
6. **Fetch PGN data** from broadcast API
7. **Generate round statistics** with Stockfish analysis
8. Verify output file exists and is valid
9. Commit and push with rebase strategy
10. Display summary

**Key Features**:

- Auto-detects which round to analyze
- Re-analyzes incomplete rounds
- Moves to next round when current completes
- Handles concurrent commits with `git pull --rebase`
- Execution time: ~10-15 minutes per round

**Environment Variables Needed**:

- `DATABASE_URL` - For database queries (optional if using API)
- `NEXTAUTH_SECRET` - For authenticated API calls (if needed)

---

#### 2.2 Season Overview Generation

**File**: `.github/workflows/generate-overview.yml`

**Schedule**: Every 2 weeks on Wednesday at 14:00 UTC (2pm)

- Runs 2 hours after biweekly analysis
- Cron: `0 14 * * 3`

**Steps**:

1. Checkout repository
2. Setup Node.js 20
3. Install dependencies
4. Determine season number (hardcoded 2 for now)
5. Generate season overview
6. Verify output
7. Commit and push

**Key Features**:

- Fast execution (~5 seconds)
- Aggregates all round stats
- Generates hall of fame and leaderboards
- Only runs if 2+ rounds completed

---

#### 2.3 Manual Round Analysis

**File**: `.github/workflows/analyze-round.yml`

**Trigger**: `workflow_dispatch` with inputs

- `round` - Round number to analyze
- `season` - Season number (default: 2)
- `depth` - Stockfish depth (default: 15)

**Use Cases**:

- Analyze specific historical rounds
- Re-run analysis with different depth
- Test workflow changes

---

#### 2.4 Batch Analysis

**File**: `.github/workflows/analyze-multiple-rounds.yml`

**Trigger**: `workflow_dispatch` with inputs

- `rounds` - Comma-separated round numbers (e.g., "1,2,3")
- `season` - Season number (default: 2)
- `depth` - Stockfish depth (default: 15)

**Use Cases**:

- Initial historical data analysis
- Bulk re-generation after bug fixes
- Migrating to new stats format

---

### Phase 3: Helper Scripts

#### 3.1 Round Detection Script

**File**: `scripts/detect-current-round.js`

```javascript
#!/usr/bin/env node

/**
 * Detect which round should be analyzed
 * Outputs: roundId, roundNumber, seasonNumber
 */

const { db } = require('./lib/db')

async function detectCurrentRound() {
  // Get active season
  const season = await db.season.findFirst({
    where: { isActive: true },
    include: {
      rounds: {
        include: {
          gameResults: {
            where: { isVerified: true },
            select: { id: true },
          },
        },
        orderBy: { roundNumber: 'asc' },
      },
    },
  })

  if (!season) {
    throw new Error('No active season found')
  }

  const now = new Date()
  const EXPECTED_GAMES = 25
  const COMPLETION_THRESHOLD = 0.8

  // Find current/incomplete round
  for (const round of season.rounds) {
    const gameCount = round.gameResults.length
    const roundStart = new Date(round.roundDate)
    const roundEnd = new Date(roundStart)
    roundEnd.setDate(roundEnd.getDate() + 14)

    // Check if round is active (started but not ended)
    const isActive = now >= roundStart && now < roundEnd
    const isComplete = gameCount >= EXPECTED_GAMES * COMPLETION_THRESHOLD

    if (isActive || !isComplete) {
      console.log(
        JSON.stringify({
          roundId: round.id,
          roundNumber: round.roundNumber,
          seasonNumber: season.seasonNumber,
          gameCount: gameCount,
          expectedGames: EXPECTED_GAMES,
          isComplete: isComplete,
          shouldAnalyze: true,
        })
      )
      return
    }
  }

  // All rounds complete, analyze latest
  const latestRound = season.rounds[season.rounds.length - 1]
  console.log(
    JSON.stringify({
      roundId: latestRound.id,
      roundNumber: latestRound.roundNumber,
      seasonNumber: season.seasonNumber,
      gameCount: latestRound.gameResults.length,
      expectedGames: EXPECTED_GAMES,
      isComplete: true,
      shouldAnalyze: false,
    })
  )
}

detectCurrentRound().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
```

**Usage in Workflow**:

```yaml
- name: Detect current round
  id: detect
  run: |
    ROUND_INFO=$(node scripts/detect-current-round.js)
    echo "round_info=$ROUND_INFO" >> $GITHUB_OUTPUT
    echo "Round info: $ROUND_INFO"
```

---

### Phase 4: Workflow Schedule Calculation

**Problem**: Cron runs every Wednesday, but we only want biweekly analysis

**Solution**: Smart filtering in workflow

```yaml
- name: Check if analysis needed
  id: check_schedule
  run: |
    # Get current date components
    YEAR=$(date +%Y)
    WEEK=$(date +%W)

    # Calculate weeks since Season 2 start (Sep 23, 2025 is week 39)
    SEASON_START_WEEK=39
    WEEKS_ELAPSED=$(( (WEEK - SEASON_START_WEEK + 52) % 52 ))

    # Run every 2 weeks (even weeks elapsed)
    if [ $(( WEEKS_ELAPSED % 2 )) -eq 0 ]; then
      echo "should_run=true" >> $GITHUB_OUTPUT
      echo "✓ Analysis week - proceeding"
    else
      echo "should_run=false" >> $GITHUB_OUTPUT
      echo "○ Off week - skipping"
      exit 0
    fi

- name: Analyze round
  if: steps.check_schedule.outputs.should_run == 'true'
  run: |
    # Analysis steps...
```

**Alternative**: Use round detection script to determine if analysis is needed

```yaml
- name: Detect round and check if analysis needed
  id: detect
  run: |
    ROUND_INFO=$(node scripts/detect-current-round.js)
    SHOULD_ANALYZE=$(echo $ROUND_INFO | jq -r '.shouldAnalyze')

    if [ "$SHOULD_ANALYZE" = "false" ]; then
      echo "✓ Round complete - no analysis needed"
      exit 0
    fi

    # Extract round info
    ROUND_ID=$(echo $ROUND_INFO | jq -r '.roundId')
    ROUND_NUM=$(echo $ROUND_INFO | jq -r '.roundNumber')
    SEASON_NUM=$(echo $ROUND_INFO | jq -r '.seasonNumber')

    echo "round_id=$ROUND_ID" >> $GITHUB_OUTPUT
    echo "round_num=$ROUND_NUM" >> $GITHUB_OUTPUT
    echo "season=$SEASON_NUM" >> $GITHUB_OUTPUT
```

---

### Phase 5: Testing Strategy

#### 5.1 Local Testing

```bash
# Test round detection
node scripts/detect-current-round.js

# Test PGN fetch
curl -s "https://classical.schachklub-k4.ch/api/broadcast/round/{roundId}/pgn"

# Test stats generation (without Stockfish)
curl -s "https://classical.schachklub-k4.ch/api/broadcast/round/{roundId}/pgn" | \
  node scripts/generate-stats.js --round 1 --season 2

# Test with Stockfish (requires venv)
curl -s "https://classical.schachklub-k4.ch/api/broadcast/round/{roundId}/pgn" | \
  node scripts/generate-stats.js --round 1 --season 2 --analyze

# Test overview generation
node scripts/generate-overview.js --season 2
```

#### 5.2 GitHub Actions Testing

1. Create workflows in draft state
2. Test with manual trigger first (`workflow_dispatch`)
3. Use specific round numbers to avoid production data
4. Verify output files generated correctly
5. Check commit messages and push behavior
6. Enable scheduled runs once validated

---

### Phase 6: Documentation Updates

Update `CLAUDE.md` with:

1. Workflow schedule and timing
2. Manual workflow trigger commands
3. Round detection logic
4. Expected game counts and thresholds
5. Troubleshooting guide

---

## Differences from Lichess 4545 Stats

| Aspect                | Lichess 4545         | Classical League         |
| --------------------- | -------------------- | ------------------------ |
| **Round Frequency**   | Weekly (Monday)      | Biweekly (Wednesday)     |
| **Schedule**          | Monday 12pm          | Wednesday 12pm           |
| **Rounds per Season** | 8 rounds             | 7 rounds                 |
| **Expected Games**    | ~160 games/round     | ~25 games/round          |
| **PGN Source**        | External Lichess API | Internal database + API  |
| **Round Detection**   | Game count threshold | Round date + game count  |
| **Mid-week Update**   | Thursday 12pm        | Not needed (slower pace) |
| **Analysis Time**     | 1-2 hours            | ~10-15 minutes           |

---

## Implementation Checklist

### Must Have (MVP)

- [ ] Create `detect-current-round.js` script
- [ ] Create `.github/workflows/biweekly-analysis.yml`
- [ ] Create `.github/workflows/generate-overview.yml`
- [ ] Test with Round 1 data
- [ ] Verify Stockfish installation on Ubuntu runners
- [ ] Test commit and push with rebase
- [ ] Update CLAUDE.md documentation

### Nice to Have

- [ ] Create `analyze-round.yml` (manual single round)
- [ ] Create `analyze-multiple-rounds.yml` (manual batch)
- [ ] Add workflow status badges to README
- [ ] Create Slack/Discord notifications on completion
- [ ] Add workflow run summary with stats preview
- [ ] Build dedicated API endpoint for round detection

### Future Enhancements

- [ ] Automatic re-analysis when new games added
- [ ] Smart depth adjustment (depth 20 for fewer games)
- [ ] Parallel analysis for batch workflows
- [ ] Cache Stockfish evaluations
- [ ] Real-time stats updates via webhook

---

## Risk Analysis and Mitigation

### Risk 1: Workflow runs on wrong week

**Mitigation**: Implement date-based filtering or use round detection script

### Risk 2: No games available for current round

**Mitigation**: Round detection script checks game count before triggering

### Risk 3: Concurrent pushes cause conflicts

**Mitigation**: Use `git pull --rebase` strategy (proven in 4545 workflows)

### Risk 4: Stockfish analysis times out

**Mitigation**:

- Set timeout to 30 minutes
- Use depth 15 (balanced speed/accuracy)
- Fallback to basic stats if timeout

### Risk 5: Invalid PGN data

**Mitigation**:

- Validate PGN before analysis
- Skip invalid games with warning
- Continue with valid games

### Risk 6: Database access from workflow

**Mitigation**:

- Use public API endpoints when possible
- Cache DATABASE_URL as GitHub secret
- Fallback to API-based detection

---

## Success Metrics

- ✅ Workflows run automatically every 2 weeks
- ✅ Round detection correctly identifies current round
- ✅ Stats generated for all rounds within 15 minutes
- ✅ Overview updated after each round analysis
- ✅ No manual intervention required
- ✅ Git conflicts handled gracefully
- ✅ Execution logs clear and informative

---

## Next Steps

1. **Review this plan** with team
2. **Implement Phase 1**: Round detection script
3. **Implement Phase 2**: Workflow files
4. **Test locally** with existing Round 1 data
5. **Deploy to GitHub** with manual triggers first
6. **Validate** with real data
7. **Enable scheduled runs**
8. **Monitor** first automated run
9. **Document** in CLAUDE.md
10. **Iterate** based on results

---

## Timeline Estimate

- **Phase 1** (Round Detection): 2 hours
- **Phase 2** (Workflow Files): 4 hours
- **Phase 3** (Helper Scripts): 1 hour
- **Phase 4** (Schedule Logic): 2 hours
- **Phase 5** (Testing): 3 hours
- **Phase 6** (Documentation): 1 hour

**Total**: ~13 hours of focused development

**Recommended**: Implement over 2-3 sessions to allow for testing between phases.
