-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "discordName" TEXT NOT NULL,
    "discordAvatar" TEXT,
    "inGameName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capture" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "won" BOOLEAN NOT NULL,
    "scoreOurs" INTEGER NOT NULL,
    "scoreTheirs" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Capture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerCapStat" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "captureId" TEXT NOT NULL,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "damage" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerCapStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaptureRoster" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "captureId" TEXT NOT NULL,

    CONSTRAINT "CaptureRoster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_discordId_key" ON "Player"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCapStat_playerId_captureId_key" ON "PlayerCapStat"("playerId", "captureId");

-- AddForeignKey
ALTER TABLE "PlayerCapStat" ADD CONSTRAINT "PlayerCapStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCapStat" ADD CONSTRAINT "PlayerCapStat_captureId_fkey" FOREIGN KEY ("captureId") REFERENCES "Capture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptureRoster" ADD CONSTRAINT "CaptureRoster_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptureRoster" ADD CONSTRAINT "CaptureRoster_captureId_fkey" FOREIGN KEY ("captureId") REFERENCES "Capture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
