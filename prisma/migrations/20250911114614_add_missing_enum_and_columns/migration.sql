-- Add missing BLACK_WIN_FF to GameResultEnum
ALTER TYPE "public"."GameResultEnum" ADD VALUE 'BLACK_WIN_FF';

-- Add missing columns to players table
ALTER TABLE "public"."players" ADD COLUMN "lichessRating" INTEGER NOT NULL DEFAULT 1500;

-- Add missing columns to game_results table  
ALTER TABLE "public"."game_results" ADD COLUMN "winningPlayerId" TEXT;

-- Add missing settings table
CREATE TABLE "public"."settings" (
    "id" TEXT NOT NULL,
    "tournamentLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint for winningPlayerId
ALTER TABLE "public"."game_results" ADD CONSTRAINT "game_results_winningPlayerId_fkey" FOREIGN KEY ("winningPlayerId") REFERENCES "public"."players"("id") ON DELETE SET NULL ON UPDATE CASCADE;