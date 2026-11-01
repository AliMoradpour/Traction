-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('BUG', 'FEATURE', 'GENERAL');

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "message" TEXT NOT NULL,
    "screen" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feedback_clientId_key" ON "feedback"("clientId");

-- CreateIndex
CREATE INDEX "feedback_userId_idx" ON "feedback"("userId");

-- CreateIndex
CREATE INDEX "feedback_createdAt_idx" ON "feedback"("createdAt");

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

