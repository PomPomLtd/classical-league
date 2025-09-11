-- Add broadcast support for Lichess integration
BEGIN;

-- Create admin_settings table
CREATE TABLE "public"."admin_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- Create unique index on key
CREATE UNIQUE INDEX "admin_settings_key_key" ON "public"."admin_settings"("key");

-- Add PGN tracking columns to rounds table
ALTER TABLE "public"."rounds" ADD COLUMN "pgn_file_path" VARCHAR(500);
ALTER TABLE "public"."rounds" ADD COLUMN "pgn_updated_at" TIMESTAMP;
ALTER TABLE "public"."rounds" ADD COLUMN "lichess_broadcast_url" VARCHAR(500);

-- Add broadcast settings to admin_settings
INSERT INTO "public"."admin_settings" ("id", "key", "value", "description") VALUES
(gen_random_uuid()::text, 'broadcast_enabled', 'false', 'Enable/disable Lichess broadcast PGN generation'),
(gen_random_uuid()::text, 'broadcast_base_url', 'https://classical.schachklub-k4.ch', 'Base URL for PGN file access'),
(gen_random_uuid()::text, 'broadcast_tournament_template', 'Classical League Season {season}', 'Template for tournament names'),
(gen_random_uuid()::text, 'broadcast_round_template', 'Round {round}', 'Template for round names');

COMMIT;