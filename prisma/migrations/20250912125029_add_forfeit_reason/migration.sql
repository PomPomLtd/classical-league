-- AlterTable
ALTER TABLE "game_results" ADD COLUMN "forfeit_reason" TEXT;

-- Make pgn column nullable for forfeit games
ALTER TABLE "game_results" ALTER COLUMN "pgn" DROP NOT NULL;