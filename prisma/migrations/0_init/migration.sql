-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."GameResultEnum" AS ENUM ('WHITE_WIN', 'BLACK_WIN', 'DRAW', 'WHITE_WIN_FF', 'BLACK_WIN_FF', 'DOUBLE_FF');

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" TEXT NOT NULL,
    "tournamentLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seasons" (
    "id" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."players" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "lichessRating" INTEGER NOT NULL DEFAULT 1500,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rulesAccepted" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedDate" TIMESTAMP(3),
    "isWithdrawn" BOOLEAN NOT NULL DEFAULT false,
    "withdrawalDate" TIMESTAMP(3),

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rounds" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "roundDate" TIMESTAMP(3) NOT NULL,
    "byeDeadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pgn_file_path" TEXT,
    "pgn_updated_at" TIMESTAMP(3),
    "lichess_broadcast_url" TEXT,

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bye_requests" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "roundId" TEXT,
    "requestedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isApproved" BOOLEAN,
    "approvedDate" TIMESTAMP(3),
    "adminNotes" TEXT,

    CONSTRAINT "bye_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game_results" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "boardNumber" INTEGER NOT NULL,
    "result" "public"."GameResultEnum" NOT NULL,
    "pgn" TEXT NOT NULL,
    "submittedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedById" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedDate" TIMESTAMP(3),
    "adminNotes" TEXT,
    "whitePlayerId" TEXT,
    "blackPlayerId" TEXT,
    "winningPlayerId" TEXT,

    CONSTRAINT "game_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_settings_key_key" ON "public"."admin_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_seasonNumber_key" ON "public"."seasons"("seasonNumber");

-- CreateIndex
CREATE UNIQUE INDEX "players_seasonId_email_key" ON "public"."players"("seasonId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "players_seasonId_nickname_key" ON "public"."players"("seasonId", "nickname");

-- CreateIndex
CREATE UNIQUE INDEX "rounds_seasonId_roundNumber_key" ON "public"."rounds"("seasonId", "roundNumber");

-- CreateIndex
CREATE INDEX "bye_requests_playerId_roundId_idx" ON "public"."bye_requests"("playerId", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "game_results_roundId_boardNumber_key" ON "public"."game_results"("roundId", "boardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "public"."admins"("username");

-- AddForeignKey
ALTER TABLE "public"."players" ADD CONSTRAINT "players_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rounds" ADD CONSTRAINT "rounds_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bye_requests" ADD CONSTRAINT "bye_requests_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bye_requests" ADD CONSTRAINT "bye_requests_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "public"."rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_results" ADD CONSTRAINT "game_results_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "public"."rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_results" ADD CONSTRAINT "game_results_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "public"."players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_results" ADD CONSTRAINT "game_results_whitePlayerId_fkey" FOREIGN KEY ("whitePlayerId") REFERENCES "public"."players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_results" ADD CONSTRAINT "game_results_blackPlayerId_fkey" FOREIGN KEY ("blackPlayerId") REFERENCES "public"."players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_results" ADD CONSTRAINT "game_results_winningPlayerId_fkey" FOREIGN KEY ("winningPlayerId") REFERENCES "public"."players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

