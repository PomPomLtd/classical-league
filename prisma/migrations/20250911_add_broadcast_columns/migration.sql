-- Add broadcast support columns to rounds table
ALTER TABLE "public"."rounds" ADD COLUMN "pgn_file_path" TEXT;
ALTER TABLE "public"."rounds" ADD COLUMN "pgn_updated_at" TIMESTAMP(3);
ALTER TABLE "public"."rounds" ADD COLUMN "lichess_broadcast_url" TEXT;

-- Create admin_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."admin_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- Create unique index on key if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS "admin_settings_key_key" ON "public"."admin_settings"("key");

-- Insert broadcast settings if they don't exist
INSERT INTO "public"."admin_settings" ("id", "key", "value", "description")
SELECT gen_random_uuid()::text, 'broadcast_enabled', 'false', 'Enable/disable Lichess broadcast PGN generation'
WHERE NOT EXISTS (SELECT 1 FROM "public"."admin_settings" WHERE "key" = 'broadcast_enabled');

INSERT INTO "public"."admin_settings" ("id", "key", "value", "description")
SELECT gen_random_uuid()::text, 'broadcast_base_url', 'https://classical.schachklub-k4.ch', 'Base URL for PGN file access'
WHERE NOT EXISTS (SELECT 1 FROM "public"."admin_settings" WHERE "key" = 'broadcast_base_url');

INSERT INTO "public"."admin_settings" ("id", "key", "value", "description")
SELECT gen_random_uuid()::text, 'broadcast_tournament_template', 'Classical League Season {season}', 'Template for tournament names'
WHERE NOT EXISTS (SELECT 1 FROM "public"."admin_settings" WHERE "key" = 'broadcast_tournament_template');

INSERT INTO "public"."admin_settings" ("id", "key", "value", "description")
SELECT gen_random_uuid()::text, 'broadcast_round_template', 'Round {round}', 'Template for round names'
WHERE NOT EXISTS (SELECT 1 FROM "public"."admin_settings" WHERE "key" = 'broadcast_round_template');