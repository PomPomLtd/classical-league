-- Make roundId optional for withdrawal requests
-- Drop the foreign key constraint first
ALTER TABLE "public"."bye_requests" DROP CONSTRAINT "bye_requests_roundId_fkey";

-- Make roundId nullable
ALTER TABLE "public"."bye_requests" ALTER COLUMN "roundId" DROP NOT NULL;

-- Recreate the foreign key constraint with nullable field
ALTER TABLE "public"."bye_requests" ADD CONSTRAINT "bye_requests_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "public"."rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;