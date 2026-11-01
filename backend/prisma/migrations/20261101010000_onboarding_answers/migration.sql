-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "dailyTimeBudget" TEXT,
ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "primaryGoal" TEXT;

