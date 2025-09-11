# Changelog

All notable changes to the Classical League Management Portal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.0] - 2025-09-11

### Added
- Tournament withdrawal functionality with admin approval workflow
- Searchable player dropdown component (reusable across forms)
- Click-to-select functionality for round tiles on bye page
- Password protection for player directory with chess-themed password "Ke2!!"
- Sad emoji (😢) on withdrawal button for emotional context
- Enhanced bye status display: "✅ Bye Active - Not Playing" instead of just "Approved"
- Clarified bye deadline display: "(when next round pairings are published)"
- Bi-weekly tournament period display on admin rounds page
- Database support for withdrawal requests (roundId nullable in bye_requests)

### Changed
- URL changed from `/results` to `/submit-result` for better UX
- Result submission form now uses SearchablePlayerDropdown for winning player
- Withdrawal requests appear as special items in admin bye management panel
- Admin rounds page shows proper Wednesday-to-Wednesday bi-weekly periods
- Bye requests can now have NULL roundId for withdrawal requests
- Replaced unique constraint with index on (playerId, roundId) to allow multiple withdrawals

### Fixed
- ESLint warnings in SearchablePlayerDropdown component
- TypeScript compilation errors with optional roundId
- Database constraint issues preventing withdrawal requests
- Unused variable warnings in admin rounds page
- Build warnings resolved for production deployment

### Technical
- Created reusable SearchablePlayerDropdown component
- Database migrations for optional roundId in bye_requests table
- Enhanced admin approval system for withdrawal processing
- Improved email templates with password and updated URLs

## [2.0.0] - 2025-09-09

### Added
- Initial tournament management system
- Player registration with admin approval
- Bye request system
- Result submission system
- Admin panel for tournament management
- Player directory with WhatsApp integration
- Multi-season support
- Swiss tournament system integration

### Technical
- Next.js 15 with App Router and Turbopack
- Prisma ORM with PostgreSQL
- TailwindCSS 4 for styling
- Email notification system
- Responsive design for mobile devices