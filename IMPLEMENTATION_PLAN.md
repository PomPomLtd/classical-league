# Implementation Plan: Result Detail View & Edit Functionality

## Overview
Add "View" action to admin results table with detailed view page and edit capability, following the exact pattern used for player management (`/admin/players/[id]/page.tsx`).

## Current State Analysis

### Player Management Pattern (Reference)
- **List View** (`/admin/players/page.tsx`):
  - Table with filters (all/pending/approved/withdrawn)
  - Search functionality
  - Quick actions: Copy Name, Approve
  - **"View" link** to detail page (`/admin/players/${id}`)

- **Detail View** (`/admin/players/[id]/page.tsx`):
  - Header with back button, player name, status badge
  - Action buttons (Approve, Withdraw)
  - **Player Information card** with edit button (pencil icon)
  - **Timeline section** (Registered → Approved → Withdrawn)
  - **Edit Modal** with React Hook Form + Zod validation
  - Pre-populates form with current data
  - PATCH API endpoint for updates

- **API Structure**:
  - `GET /api/admin/players/[id]` - Fetch single player
  - `PATCH /api/admin/players/[id]` - Update player data
  - `POST /api/admin/players/[id]/approve` - Approve action
  - `POST /api/admin/players/[id]/withdraw` - Withdraw action

### Current Result Management
- **List View** (`/admin/results/page.tsx`):
  - Table with filters (all/unverified/processed)
  - Search by round/board/player
  - Quick action: Process (verify)
  - ❌ **NO "View" link** - needs to be added

- **API Endpoints**:
  - `GET /api/admin/results` - List all results
  - `POST /api/admin/results/[id]/verify` - Mark as verified
  - `POST /api/admin/results/[id]/assign` - Assign players
  - ❌ **Missing**: `GET /api/admin/results/[id]` - Fetch single result
  - ❌ **Missing**: `PATCH /api/admin/results/[id]` - Update result data

### GameResult Schema (from Prisma)
```prisma
model GameResult {
  id               String         # Primary key
  roundId          String         # Foreign key to Round
  boardNumber      Int            # Board number
  result           GameResultEnum # Result type (WHITE_WIN, BLACK_WIN, etc.)
  pgn              String?        # PGN notation (optional for forfeits)
  forfeitReason    String?        # Forfeit explanation
  submittedDate    DateTime       # Submission timestamp
  submittedById    String?        # Submitter player ID
  isVerified       Boolean        # Verification status
  verifiedDate     DateTime?      # Verification timestamp
  adminNotes       String?        # Admin notes
  whitePlayerId    String?        # White player (assigned by admin)
  blackPlayerId    String?        # Black player (assigned by admin)
  winningPlayerId  String?        # Winning player

  # Relations
  round            Round          # Round details
  submittedBy      Player?        # Submitter
  whitePlayer      Player?        # White player object
  blackPlayer      Player?        # Black player object
  winningPlayer    Player?        # Winner object
}
```

## Implementation Steps

---

### **Stage 1: Add "View" Link to Results List**
**Goal**: Add "View" action button to results table
**Status**: Not Started

**Tasks**:
1. Open `/app/admin/results/page.tsx`
2. In the Actions column (line 276), add a "View" link after the "Process" button
3. Import `Link` from `next/link` at top of file

**Success Criteria**:
- ✅ "View" link appears in Actions column for all results
- ✅ Link navigates to `/admin/results/[id]` (will 404 until Stage 2)

---

### **Stage 2: Create GET API Endpoint for Single Result**
**Goal**: Fetch detailed result data including all relations
**Status**: Not Started

**Tasks**:
1. Create file: `/app/api/admin/results/[id]/route.ts`
2. Implement `GET` handler with:
   - Admin authentication check (session validation)
   - Fetch single `GameResult` by ID with includes:
     - `round` (roundNumber, roundDate)
     - `submittedBy` (player who submitted)
     - `whitePlayer`, `blackPlayer`, `winningPlayer` (full player objects)
   - Format player names (firstName + lastInitial pattern)
   - Return formatted JSON
3. Handle 404 if result not found
4. Handle 401 if not authenticated

**Success Criteria**:
- ✅ `GET /api/admin/results/[id]` returns full result data
- ✅ Includes all player relations with formatted names
- ✅ Returns 404 for invalid IDs
- ✅ Returns 401 for non-admin users

---

### **Stage 3: Create Result Detail View Page**
**Goal**: Display comprehensive result details with timeline
**Status**: Not Started

**Tasks**:
1. Create file: `/app/admin/results/[id]/page.tsx`
2. Implement component structure (mirror player detail page):
   - Header with back button, result title, status badge, action buttons
   - Game Information card with edit button
   - PGN/Forfeit Section card
   - Admin Notes card (if exists)
   - Timeline section (Submitted → Verified)
3. Add loading state and error handling

**Success Criteria**:
- ✅ Page displays all result data in organized cards
- ✅ Timeline shows submission and verification events
- ✅ PGN displayed in readable monospace format

---

### **Stage 4: Add Edit Modal with Form Validation**
**Goal**: Allow admins to edit result data
**Status**: Not Started

**Tasks**:
1. Add React Hook Form + Zod validation
2. Define validation schema in `/lib/validations.ts`
3. Create edit modal UI with all fields
4. Add loading states and validation

**Success Criteria**:
- ✅ Edit button opens modal with pre-populated data
- ✅ Form validates before submission
- ✅ Modal closes on successful save

---

### **Stage 5: Create PATCH API Endpoint for Updates**
**Goal**: Handle result updates from edit form
**Status**: Not Started

**Tasks**:
1. Add `PATCH` handler to `/app/api/admin/results/[id]/route.ts`
2. Validate request body and business rules
3. Update database and return updated result

**Success Criteria**:
- ✅ `PATCH /api/admin/results/[id]` updates result
- ✅ Validation catches invalid data

---

### **Stage 6: Add Player Selection to Edit Form**
**Goal**: Allow admins to assign/change players
**Status**: Not Started

**Tasks**:
1. Fetch approved players list
2. Use `SearchablePlayerDropdown` for player selection
3. Add validation for player assignments

**Success Criteria**:
- ✅ Player dropdowns work correctly
- ✅ Validation prevents invalid assignments

---

### **Stage 7: Testing & Refinements**
**Goal**: Ensure everything works end-to-end
**Status**: Not Started

**Tasks**:
1. Manual testing of all flows
2. Edge case testing
3. UI/UX polish
4. Build & lint checks

**Success Criteria**:
- ✅ All user flows work end-to-end
- ✅ No TypeScript or linting errors

---

### **Stage 8: Commit & Deploy**
**Goal**: Ship to production
**Status**: Not Started

**Tasks**:
1. Review changes
2. Commit and push
3. Verify deployment

**Success Criteria**:
- ✅ Code committed and deployed successfully

---

## File Changes Summary

### New Files
- `/app/admin/results/[id]/page.tsx` - Result detail view
- `/app/api/admin/results/[id]/route.ts` - GET and PATCH handlers

### Modified Files
- `/app/admin/results/page.tsx` - Add "View" link
- `/lib/validations.ts` - Add gameResultEditSchema

---

## Estimated Time: ~3 hours total
