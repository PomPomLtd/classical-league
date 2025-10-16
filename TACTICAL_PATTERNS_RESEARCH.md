# Tactical Patterns Research & Implementation Plan

## Issues Found

1. **Crosshairs**: Shows "Move 28" but uses ply count (half-moves) not full moves - confusing
2. **Skewers**: 9 skewers seems high - detecting geometric x-rays, not tactical skewers
3. **Forks**: 28 forks in one game - too broad (counting trivial forks)

## Research: What Are These Patterns?

### 1. PINS ✓ (Currently Working Correctly)

**Definition**: A piece cannot legally move because it would expose the king to check.

**Types**:
- **Absolute pin**: Piece shields the king from attack (illegal to move)
- **Relative pin**: Piece shields another valuable piece (legal but disadvantageous to move)

**Python-chess detection**: `board.is_pinned(color, square)` detects ABSOLUTE pins only.

**Current implementation**: ✓ CORRECT
- Uses `is_pinned()` to detect absolute pins
- Tracks pinned pieces to only count NEW pins when created
- Does not count same pin on subsequent moves

**Example from games**:
- Move 35 (ply): Pawn on f2 pinned by Black queen on c5
- Move 42 (ply): White queen on e1 pinned by Black rook on d1

**Verdict**: Keep as-is, but convert ply to full moves for display.

---

### 2. FORKS (Too Broad - Needs Refinement)

**Definition**: One piece attacks two or more enemy pieces simultaneously, forcing the opponent to lose material.

**Tactical significance**:
- Fork is only meaningful if opponent cannot save all pieces
- Attacking two undefended pawns on opposite sides is geometrically a fork but not tactically interesting
- Most valuable forks involve pieces (not just pawns)

**Current implementation**: PROBLEM
- Counts ANY piece attacking 2+ enemy pieces
- Includes trivial forks like:
  - Bishop e6 attacking pawns on a2 and h3 (opposite sides, both defended)
  - Queen attacking two pawns

**Research - What makes a fork tactically significant?**

From chess literature:
1. **Royal fork**: Involves the king (king + any other piece)
2. **Family fork**: Knight attacks king, queen, and rook
3. **Knight fork**: Classic double attack by knight
4. **Significant fork**: Attacks pieces of combined value >= 6 (two minor pieces or better)

**Proposed refinement**:
- Count forks where:
  - One attacked piece is the KING (royal fork), OR
  - At least one attacked piece has value >= 3 (not just pawns), OR
  - Total value of attacked pieces >= 6

This filters out trivial pawn forks while keeping meaningful tactics.

---

### 3. SKEWERS (Too Broad - Major Issues)

**Definition**: An x-ray attack where a MORE valuable piece is attacked and must move, exposing a LESS valuable piece behind it to capture.

**Key difference from pin**:
- **Pin**: Low-value in front, high-value behind (front piece cannot/should not move)
- **Skewer**: High-value in front, low-value behind (front piece must move, back piece is lost)

**Current implementation**: MAJOR PROBLEMS

We detect "geometric skewers":
- Long-range piece (R/B/Q) attacks a more valuable piece
- Less valuable piece is behind it on the same ray
- We count this as a skewer

**Problems**:
1. Not checking if front piece is ACTUALLY under attack (could be defended)
2. Not checking if back piece is defended
3. Not checking if front piece can block or defend
4. Not checking if it's actually forcing

**Example from Diego game**: 9 skewers
- Bg5 attacks Nf6 with pawn e7 behind
- But is the knight forced to move? Is it even attacked (could be defended)?
- Is the pawn behind defended?

**Real skewer example** (from chess.com):
- White rook on a1
- Black king on a8, Black rook on a7
- Rook attacks king (check), king must move, then rook takes rook
- This is a FORCING skewer

**Problem**: Detecting TRUE tactical skewers requires:
1. Evaluating if the attack is forcing
2. Checking if pieces are defended
3. Checking if the skewer actually wins material

This is VERY complex and beyond simple geometric detection.

**Proposed solutions**:
- **Option A**: Remove skewers entirely (too hard to detect accurately)
- **Option B**: Make much more strict - only count if:
  - Front piece is KING (forcing) or QUEEN (very valuable)
  - Back piece is not defended (would require attack counting)
- **Option C**: Rename to "X-Ray Attacks" (more accurate for what we detect)

---

## Display Issues

### Ply vs Full Moves

Current: "Move 28: Rad8"
- Using ply count (half-moves, 1-indexed)
- Ply 28 = move 14 for Black

Should display: "14...Rad8" (chess notation)
- Ply to full move: `(ply + 1) // 2`
- Color: ply % 2 == 1 ? White : Black

---

## Implementation Plan

### Phase 1: Fix Display (Move Numbers)
1. Convert ply to full move notation in Crosshairs display
2. Add color indicator (14. or 14...)

### Phase 2: Refine Forks
1. Add filter for "tactically significant" forks:
   - Royal fork (king involved), OR
   - At least one piece value >= 3, OR
   - Total value >= 6
2. Test on Diego game (should reduce from 28 to ~10)

### Phase 3: Fix Skewers
Decision needed:
- Remove entirely?
- Make very strict (king/queen only)?
- Rename to "X-Ray Attacks"?

Let's discuss which option to take.
