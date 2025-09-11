# Lichess Broadcast Integration Specification

## Overview
This document outlines the integration of Lichess broadcast functionality into the Classical League Management Portal. The integration will automatically create and update Lichess broadcasts using submitted game results from tournament rounds.

## Research Summary

### Lichess Broadcast System Architecture
- **Tournaments**: Top-level containers for a tournament series
- **Rounds**: Individual rounds within a tournament (e.g., Round 1, Round 2)
- **Games**: Individual chess games within each round
- **PGN Updates**: Games are updated via PGN push API or source URL polling

### API Authentication
- **Method**: OAuth2 Personal API Token or OAuth2 PKCE flow
- **Required Scope**: `study:write` (allows creating and modifying studies/broadcasts)
- **Token Management**: Tokens are long-lived (1 year), store securely in environment variables
- **Rate Limits**: "Only make one request at a time" - implement proper request queuing

## Key API Endpoints

| Endpoint | Method | Purpose | Authentication |
|----------|--------|---------|----------------|
| `/broadcast/new` | POST | Create tournament | OAuth2 + study:write |
| `/broadcast/{tournamentId}/new` | POST | Create round | OAuth2 + study:write |
| `/broadcast/round/{roundId}/edit` | POST | Update round | OAuth2 + study:write |
| `/api/broadcast/round/{roundId}/push` | POST | Push PGN updates | OAuth2 + study:write |
| `/api/broadcast/round/{roundId}.pgn` | GET | Export round PGN | Public |

## PGN Format Requirements

### Required Header Tags (Seven Tag Roster)
```pgn
[Event "Classical League Season 2"]
[Site "Schachklub K4"]
[Date "2025.09.23"]
[Round "1"]
[White "Player Name"]
[Black "Player Name"]
[Result "1-0"]
```

### Critical Requirements
- **Player Names**: White and Black tags MUST have actual player names (not empty)
- **Game Order**: Order of games in PGN cannot change during broadcast
- **Valid PGN**: No unclosed brackets, legal moves only
- **Result Tag**: Must match actual game outcome

### Optional but Recommended Tags
```pgn
[WhiteElo "1800"]
[BlackElo "1750"]
[ECO "B10"]
[Opening "Caro-Kann Defence"]
[TimeControl "90+30"]
[Board "1"]
```

## Recommended Implementation Approach: Public URL Method

Based on research and simplicity, we'll implement the **Public URL approach** where:
1. Our system generates and serves PGN files at public URLs
2. Lichess polls these URLs every few seconds for updates  
3. Manual tournament/round creation via Lichess web interface (one-time setup)
4. No OAuth2 complexity or API rate limiting issues

## Implementation Plan

### Phase 1: Database Schema & PGN File Generation
**Goal**: Generate and serve tournament PGN files publicly

#### Database Changes
```sql
-- Add broadcast tracking to rounds  
ALTER TABLE rounds ADD COLUMN pgn_file_path VARCHAR(500);
ALTER TABLE rounds ADD COLUMN pgn_updated_at TIMESTAMP;
ALTER TABLE rounds ADD COLUMN lichess_source_url VARCHAR(500);

-- Add Lichess settings to admin settings  
-- lichess_enabled, pgn_base_url, etc.
```

#### Admin Settings Page
- Toggle for enabling/disabling PGN generation
- Base URL configuration for PGN files
- Tournament naming template configuration
- Round naming template configuration

### Phase 2: Public PGN File Generation
**Goal**: Generate PGN files and serve them at public URLs

#### PGN File Generation Service
```typescript
interface RoundPGN {
  roundId: string
  pgn: string
  gameCount: number
  lastUpdated: Date
  errors: string[]
}

class PGNFileService {
  generateRoundPGN(roundId: string): Promise<RoundPGN>
  saveRoundPGNFile(roundId: string, pgn: string): Promise<string>
  getRoundPGNUrl(roundId: string): string
  validatePGN(pgnText: string): { isValid: boolean; errors: string[] }
  formatForBroadcast(gameResults: GameResult[]): string
}
```

#### Public PGN Endpoint
- Create API endpoint: `/api/broadcast/round/{roundId}/pgn`
- Serve static PGN files from public directory
- Set appropriate cache headers for Lichess polling
- Handle CORS for cross-origin requests

### Phase 3: Result Processing & PGN Updates
**Goal**: Update PGN files when new results are submitted

#### PGN Update Workflow
1. **Trigger**: New game result submitted and verified by admin
2. **Process**:
   - Extract player names and map to White/Black
   - Validate and clean submitted PGN
   - Add required broadcast headers
   - Regenerate complete round PGN file
   - Save to public directory with timestamp
   - Log success/failure

#### Game Result Enhancement
- Extract player names from winning player selection and board assignments
- Map board numbers to correct White/Black player assignments  
- Validate PGN format and moves before including
- Add required header tags for broadcast compatibility
- Handle multiple results for same board (updates/corrections)

### Phase 4: Manual Broadcast Setup (One-time)
**Goal**: Guide admins through Lichess broadcast creation

#### Broadcast Setup Instructions
1. **Tournament Creation** (Manual via Lichess web):
   - Go to https://lichess.org/broadcast/new
   - Create tournament: "Classical League Season {number}"
   - Add description with tournament details
   - Enable automatic leaderboard

2. **Round Creation** (Manual via Lichess web):
   - Create rounds for each tournament round
   - Set Source URL to: `https://your-domain.com/api/broadcast/round/{roundId}/pgn`
   - Lichess will poll this URL every few seconds

#### Admin Interface Support
- Display round PGN URLs for easy copying into Lichess
- Show QR codes for quick mobile access to URLs
- Provide setup instructions and examples
- Track which rounds have broadcasts configured

### Phase 5: Automated PGN Generation
**Goal**: Update broadcasts as new results are submitted

#### Update Workflow
1. **Trigger**: New game result submitted and verified by admin
2. **Process**:
   - Extract and validate PGN from result
   - Map board number to player names (White/Black assignment)
   - Add required headers for broadcast format
   - Combine with existing round PGN
   - Push updated PGN to Lichess round
   - Log success/failure

#### PGN Aggregation Strategy
- Maintain complete round PGN in database
- Append new games to existing PGN
- Preserve game order (important for Lichess)
- Handle game updates (same board number, different result)

### Phase 6: Admin Interface Enhancements
**Goal**: Allow admins to manage broadcasts and troubleshoot issues

#### Admin Round Management Page
- Show Lichess broadcast URLs for each round
- Display broadcast creation status
- Manual PGN regeneration and push buttons
- View current broadcast PGN content
- Error logs and retry functionality

#### Admin Season Management Page  
- Link to Lichess tournament page
- Tournament creation status
- Manual tournament creation option
- Broadcast settings per season

## User Interface Changes

### Admin Settings Page
```typescript
// Add new settings section
interface LichessSettings {
  enabled: boolean
  apiToken: string
  tournamentTemplate: string // e.g., "Classical League Season {season}"
  roundTemplate: string     // e.g., "Round {round}"
  autoCreateTournaments: boolean
  autoCreateRounds: boolean
}
```

### Admin Results Page
- Add broadcast status column to results table
- Show Lichess round links when available
- Display PGN processing errors
- Manual broadcast update buttons

### Admin Rounds Page  
- Add broadcast creation status indicators
- Link to Lichess round pages
- Show participant count and game count
- Manual broadcast management actions

## Technical Implementation Details

### Environment Variables
```env
LICHESS_API_TOKEN=your_token_here
LICHESS_BASE_URL=https://lichess.org
LICHESS_ENABLED=true
```

### Database Migrations
```typescript
// Add Lichess tracking fields
await db.$executeRaw`
  ALTER TABLE seasons ADD COLUMN lichess_tournament_id VARCHAR(255);
  ALTER TABLE seasons ADD COLUMN lichess_tournament_url VARCHAR(500);
  ALTER TABLE rounds ADD COLUMN lichess_round_id VARCHAR(255);
  ALTER TABLE rounds ADD COLUMN lichess_round_url VARCHAR(500);
  ALTER TABLE rounds ADD COLUMN broadcast_created_at TIMESTAMP;
`
```

### API Rate Limiting
- Implement request queue with delays
- Maximum 1 request per second to Lichess
- Exponential backoff on failures
- Priority system (PGN updates > round creation > tournament creation)

### Error Handling
- Log all Lichess API responses
- Admin notifications for persistent failures  
- Graceful degradation (tournament continues without broadcast)
- Manual retry mechanisms in admin panel

## Security Considerations

### API Token Management
- Store tokens in environment variables only
- Never expose tokens in client-side code
- Implement token rotation capability
- Monitor for unauthorized API usage

### PGN Data Validation
- Sanitize all PGN input before sending to Lichess
- Validate player names for appropriate content
- Check for potential injection attacks in PGN headers
- Limit PGN size to prevent abuse

## Success Metrics

### Technical Metrics
- Tournament creation success rate > 95%
- Round creation success rate > 95%  
- PGN update success rate > 98%
- Average API response time < 2 seconds

### User Experience Metrics
- Admin can create broadcasts with 1-click
- Results appear on Lichess within 5 minutes of submission
- Zero manual PGN formatting required
- Broadcast URLs automatically shared with participants

## Testing Strategy

### Unit Tests
- PGN validation and formatting
- Player name extraction from results
- Header tag generation
- API request formatting

### Integration Tests
- Mock Lichess API responses
- End-to-end result submission to broadcast
- Tournament and round creation workflows
- Error handling and retry logic

### Manual Testing
- Create test tournament on Lichess
- Submit various game result formats
- Verify broadcasts update correctly
- Test admin interface functionality

## Deployment Considerations

### Configuration Management
- Staging environment with test Lichess account
- Production environment with official account
- Feature flags for gradual rollout
- Rollback strategy for API changes

### Monitoring & Alerting
- Track API failure rates
- Monitor PGN processing errors  
- Alert on authentication failures
- Dashboard for broadcast health metrics

## Future Enhancements

### Phase 7: Advanced Features (Future)
- Automatic leaderboard generation
- Player rating integration
- Game embedding on tournament site
- Live game streaming for online games
- Tournament result export to multiple formats
- Historical broadcast archiving

### Integration Possibilities
- ChessBase format exports
- Tournament management software integration
- Social media auto-posting of results
- Email notifications with broadcast links
- Mobile app push notifications

This specification provides a comprehensive roadmap for integrating Lichess broadcasts into the tournament management system, ensuring reliable, automated broadcast creation and updates while maintaining data integrity and user experience.