-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('free', 'active', 'past_due', 'canceled');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
