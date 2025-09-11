-- Drop the unique constraint on (playerId, roundId)
DROP INDEX IF EXISTS "bye_requests_playerId_roundId_key";

-- Create a regular index instead of unique constraint
-- This allows multiple NULL values for roundId (withdrawal requests)
CREATE INDEX "bye_requests_playerId_roundId_idx" ON "public"."bye_requests"("playerId", "roundId");