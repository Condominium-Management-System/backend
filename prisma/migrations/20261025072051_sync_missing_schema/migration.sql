-- CreateEnum
CREATE TYPE "IddirClaimStatus" AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'disbursed');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EqubMemberStatus" ADD VALUE 'pending';
ALTER TYPE "EqubMemberStatus" ADD VALUE 'rejected';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IddirMemberStatus" ADD VALUE 'pending';
ALTER TYPE "IddirMemberStatus" ADD VALUE 'rejected';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ReportCategory" ADD VALUE 'equb_membership';
ALTER TYPE "ReportCategory" ADD VALUE 'iddir_membership';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ReportStatus" ADD VALUE 'approved';
ALTER TYPE "ReportStatus" ADD VALUE 'rejected';

-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "lostFoundId" TEXT;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "equbId" TEXT,
ADD COLUMN     "iddirId" TEXT;

-- CreateTable
CREATE TABLE "iddir_claims" (
    "id" TEXT NOT NULL,
    "iddirId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "claimType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "amountRequested" DECIMAL(15,2) NOT NULL,
    "amountApproved" DECIMAL(15,2),
    "status" "IddirClaimStatus" NOT NULL DEFAULT 'submitted',
    "documentUrl" TEXT,
    "adminNotes" TEXT,
    "reviewedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iddir_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_reads" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_reads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "iddir_claims_transactionId_key" ON "iddir_claims"("transactionId");

-- CreateIndex
CREATE INDEX "iddir_claims_iddirId_idx" ON "iddir_claims"("iddirId");

-- CreateIndex
CREATE INDEX "iddir_claims_userId_idx" ON "iddir_claims"("userId");

-- CreateIndex
CREATE INDEX "iddir_claims_status_idx" ON "iddir_claims"("status");

-- CreateIndex
CREATE INDEX "announcement_reads_userId_idx" ON "announcement_reads"("userId");

-- CreateIndex
CREATE INDEX "announcement_reads_announcementId_idx" ON "announcement_reads"("announcementId");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_reads_announcementId_userId_key" ON "announcement_reads"("announcementId", "userId");

-- CreateIndex
CREATE INDEX "chat_messages_lostFoundId_idx" ON "chat_messages"("lostFoundId");

-- CreateIndex
CREATE INDEX "reports_equbId_idx" ON "reports"("equbId");

-- CreateIndex
CREATE INDEX "reports_iddirId_idx" ON "reports"("iddirId");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_equbId_fkey" FOREIGN KEY ("equbId") REFERENCES "equibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_iddirId_fkey" FOREIGN KEY ("iddirId") REFERENCES "iddirs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_lostFoundId_fkey" FOREIGN KEY ("lostFoundId") REFERENCES "lost_and_found"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iddir_claims" ADD CONSTRAINT "iddir_claims_iddirId_fkey" FOREIGN KEY ("iddirId") REFERENCES "iddirs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iddir_claims" ADD CONSTRAINT "iddir_claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iddir_claims" ADD CONSTRAINT "iddir_claims_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iddir_claims" ADD CONSTRAINT "iddir_claims_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
