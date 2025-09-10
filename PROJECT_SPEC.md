# Classical Chess League Management Portal - Specification

## Project Overview
A web application for managing a classical chess league tournament with player registration, bye management, result entry, and tournament information.

## Tournament Details
- Format: Swiss system tournament
- Schedule: 1 round every 2 weeks
- Start Date: September 23rd, 2025
- External pairing system: swissystem.org
- Current Season: 2
- Expected Scale: ~50 players, 7 rounds per season

## Functional Requirements

### 1. Player Registration
- **Form Fields:**
  - Full name (required, text)
  - Email address (required, email validation)
  - Phone number (required, for WhatsApp)
  - Nickname/Username (required, unique, text)
  - Rules acceptance (required, checkbox)
- **Admin Approval Flow:**
  - Registration creates pending player
  - Admin manually adds to swissystem.org
  - Admin approves in admin panel
  - Player appears in public directory after approval
- **Data Storage:** Player information must be persisted
- **Validation:** 
  - Duplicate email/nickname prevention
  - Email format validation
  - Phone number validation
  - All fields required

### 2. Tournament Rules Page
- **Content:** Static page with tournament rules
- **Requirements:**
  - Clear, readable formatting
  - Mobile responsive
  - Possibly versioned (date of last update)

### 3. Bye Management System
- **Round Byes:**
  - No authentication required (public form)
  - Player selection (dropdown of approved players)
  - List of upcoming rounds with dates
  - Checkbox selection for bye rounds
  - Save/Update functionality
  - Admin approval in admin panel
- **Tournament Withdrawal:**
  - Separate option to withdraw completely
  - Confirmation dialog
  - Admin handles in admin panel
- **Constraints:**
  - Cannot request bye for past rounds
  - Bye deadline: Wednesday noon before round
  - No limit on number of byes

### 4. Player Directory
- **Features:**
  - Shows only approved players
  - Searchable by name or nickname
  - Display: Name, Nickname
  - WhatsApp integration (click to chat)
- **WhatsApp Link Format:** 
  - Uses phone number from registration
  - Format: `https://wa.me/{phonenumber}`

### 5. Result Entry System (NEW)
- **Form Fields:**
  - Round number (dropdown)
  - Board number (number input)
  - Result selection:
    - 1-0 (White wins)
    - 0-1 (Black wins)
    - 1/2-1/2 (Draw)
    - 1-0 FF (Forfeit)
    - 0-0 FF (Double forfeit)
  - PGN notation (required, textarea)
- **Validation:**
  - Board number must be valid
  - PGN format validation
  - Round must be active/completed
- **Admin Review:**
  - All results appear in admin panel
  - Admin can verify/edit/delete
  - Admin manually matches board numbers to players

### 6. Tournament Links Page
- **External Links to swissystem.org:**
  - Current pairings
  - Standings/Crosstable
- **Display Options:**
  - Styled link cards

## Technical Requirements

### Frontend
- Modern, responsive design
- TailwindCSS 4 for styling
- Mobile-first approach
- Accessible (WCAG 2.1 AA)

### Backend Needs
- Player data persistence with approval status
- Bye request storage with approval workflow
- Result submission storage
- Admin authentication (single admin account)
- Multi-season support
- No email service needed (admin handles notifications)

### Deployment
- Git-based deployment preferred
- SSL certificate required
- Custom domain support

## Data Model

### Season
- id (unique)
- season_number
- name
- start_date
- end_date
- is_active

### Player
- id (unique)
- season_id (foreign key)
- full_name
- email (unique per season)
- nickname (unique per season)
- phone_number
- registration_date
- rules_accepted
- is_approved (default: false)
- approved_date
- is_withdrawn (default: false)
- withdrawal_date

### ByeRequest
- id
- player_id (foreign key)
- round_id (foreign key)
- requested_date
- is_approved (nullable - pending if null)
- approved_date
- admin_notes

### Round
- id
- season_id (foreign key)
- round_number
- round_date
- bye_deadline (Wednesday noon before round)

### GameResult
- id
- round_id (foreign key)
- board_number
- result (enum: '1-0', '0-1', '1/2-1/2', '1-0FF', '0-0FF')
- pgn (text)
- submitted_date
- is_verified (default: false)
- verified_date
- admin_notes
- white_player_id (nullable, added by admin)
- black_player_id (nullable, added by admin)

### Admin
- id
- username
- password_hash
- last_login

## Admin Panel Features

### Dashboard
- Pending player registrations count
- Pending bye requests count
- Recent game results
- Current round information

### Player Management
- View all players (pending/approved/withdrawn)
- Approve/reject registrations
- Edit player information
- Mark as withdrawn
- Filter by season

### Bye Management
- View all bye requests
- Approve/reject with notes
- Filter by round
- See player bye history

### Result Management
- View all submitted results
- Verify/edit results
- Add admin notes
- Export for swissystem.org

### Season Management
- Create new seasons
- Set active season
- Manage rounds and dates

## Security Considerations
- GDPR compliance for EU players
- Secure storage of personal data
- Admin authentication with hashed passwords
- Rate limiting on forms
- Input sanitization for PGN

## User Flow

### New Player Registration
1. Visit registration page
2. Fill out form (name, email, phone, nickname)
3. Accept rules (checkbox)
4. Submit form
5. Admin receives notification in panel
6. Admin adds player to swissystem.org
7. Admin approves in system
8. Player appears in directory

### Requesting Byes
1. Visit bye management page
2. Select player from dropdown
3. Select round(s) for bye
4. Submit request
5. Admin reviews in panel
6. Admin approves/rejects

### Submitting Game Results
1. Visit result entry page
2. Select round number
3. Enter board number
4. Select result
5. Enter PGN notation
6. Submit result
7. Admin matches board to players and verifies

### Finding Players
1. Visit player directory
2. Search by name/nickname
3. Click on player
4. Open WhatsApp chat

## Implementation Priorities

### Phase 1 - Core Setup
- Next.js project initialization
- Database schema with Prisma
- Basic routing structure
- TailwindCSS 4 setup

### Phase 2 - Public Pages
- Rules page
- Player registration form
- Tournament links page

### Phase 3 - Admin Foundation
- Admin authentication
- Admin dashboard
- Player approval workflow

### Phase 4 - Player Features
- Player directory with search
- Bye request system
- Result entry system

### Phase 5 - Polish
- Multi-season support
- Data validation
- Mobile optimization
- Performance optimization