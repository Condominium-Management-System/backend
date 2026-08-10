-- CreateEnum
CREATE TYPE "Role" AS ENUM ('resident', 'condo_admin', 'guard', 'super_admin');

-- CreateEnum
CREATE TYPE "RoomModel" AS ENUM ('studio', 'one_bedroom', 'two_bedroom', 'three_bedroom');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('free', 'occupied', 'reserved');

-- CreateEnum
CREATE TYPE "EqubIddirStatus" AS ENUM ('pending', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ActiveInactiveStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('iddir', 'equb', 'guard_fee', 'service_charge', 'other');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cbe', 'telebirr', 'cash', 'bank_transfer');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('general', 'shop_alert', 'emergency', 'event', 'mourning', 'celebration');

-- CreateEnum
CREATE TYPE "CreatorRole" AS ENUM ('admin', 'guard', 'resident', 'super_admin');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('plumbing', 'electrical', 'structural', 'security', 'noise', 'other');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('reported', 'assigned', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "ReportPriority" AS ENUM ('low', 'medium', 'high', 'emergency');

-- CreateEnum
CREATE TYPE "LostFoundType" AS ENUM ('lost', 'found');

-- CreateEnum
CREATE TYPE "LostFoundCategory" AS ENUM ('electronics', 'documents', 'keys', 'clothing', 'jewelry', 'other');

-- CreateEnum
CREATE TYPE "LostFoundStatus" AS ENUM ('open', 'matched', 'claimed', 'archived');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('message', 'photo', 'file');

-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('shop', 'technical', 'other');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'resident',
    "condoId" TEXT,
    "condoCode" TEXT,
    "block" TEXT,
    "roomNo" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "profilePhoto" TEXT,
    "fan" VARCHAR(16) NOT NULL,
    "revenue" DECIMAL(15,2),
    "frontId" TEXT,
    "backId" TEXT,
    "isInIddir" BOOLEAN NOT NULL DEFAULT false,
    "isInEqub" BOOLEAN NOT NULL DEFAULT false,
    "isGetEqub" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "emailVerifyToken" TEXT,
    "emailVerifyExpires" TIMESTAMP(3),
    "registerDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "addToEqubById" TEXT,
    "addToIddirById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condos" (
    "id" TEXT NOT NULL,
    "condoCode" VARCHAR(50) NOT NULL,
    "condoName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "gpsCoordinates" JSONB,
    "maxAdmins" INTEGER NOT NULL DEFAULT 3,
    "blockNumbers" TEXT[],
    "activeStatus" BOOLEAN NOT NULL DEFAULT true,
    "customSettings" JSONB,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "condos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "blockNo" TEXT NOT NULL,
    "noRooms" INTEGER NOT NULL,
    "noFloors" INTEGER NOT NULL,
    "availableRooms" INTEGER NOT NULL DEFAULT 0,
    "occupiedRooms" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "roomNo" TEXT NOT NULL,
    "floorNo" INTEGER NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "model" "RoomModel" NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'free',
    "occupiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equibs" (
    "id" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "noMembers" INTEGER NOT NULL,
    "members" JSONB[],
    "status" "EqubIddirStatus" NOT NULL DEFAULT 'pending',
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "contributionAmount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "equibs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iddirs" (
    "id" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "noMembers" INTEGER NOT NULL,
    "members" JSONB[],
    "status" "ActiveInactiveStatus" NOT NULL DEFAULT 'active',
    "startedDate" TIMESTAMP(3) NOT NULL,
    "contributionAmount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "iddirs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "monthYear" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "transactionId" TEXT,
    "paymentDate" TIMESTAMP(3),
    "adminNotes" TEXT,
    "approvedById" TEXT,
    "approvalDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderAccNo" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "receiverAccNo" TEXT NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "stamp" TEXT,
    "paymentType" "PaymentType",
    "amount" DECIMAL(15,2) NOT NULL,
    "monthYear" TEXT,
    "paymentMethod" "PaymentMethod",
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "announcementType" "AnnouncementType" NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdByRole" "CreatorRole",
    "imageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "photoUrl" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'reported',
    "reporterId" TEXT NOT NULL,
    "reporterRole" "CreatorRole",
    "priority" "ReportPriority" NOT NULL,
    "assignedToId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lost_and_found" (
    "id" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "type" "LostFoundType" NOT NULL,
    "userId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "LostFoundCategory" NOT NULL,
    "photoUrl" TEXT,
    "location" TEXT,
    "dateLostFound" TIMESTAMP(3) NOT NULL,
    "status" "LostFoundStatus" NOT NULL DEFAULT 'open',
    "claimedById" TEXT,
    "claimVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lost_and_found_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "type" "ChatType" NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "type" "PromoType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "postedById" TEXT NOT NULL,
    "postedByRole" "CreatorRole",
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "contactNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_fan_key" ON "users"("fan");

-- CreateIndex
CREATE UNIQUE INDEX "users_refreshToken_key" ON "users"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetPasswordToken_key" ON "users"("resetPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_emailVerifyToken_key" ON "users"("emailVerifyToken");

-- CreateIndex
CREATE INDEX "users_condoId_idx" ON "users"("condoId");

-- CreateIndex
CREATE INDEX "users_condoCode_idx" ON "users"("condoCode");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "condos_condoCode_key" ON "condos"("condoCode");

-- CreateIndex
CREATE INDEX "condos_deletedAt_idx" ON "condos"("deletedAt");

-- CreateIndex
CREATE INDEX "blocks_condoId_idx" ON "blocks"("condoId");

-- CreateIndex
CREATE UNIQUE INDEX "blocks_condoId_blockNo_key" ON "blocks"("condoId", "blockNo");

-- CreateIndex
CREATE INDEX "rooms_condoId_idx" ON "rooms"("condoId");

-- CreateIndex
CREATE INDEX "rooms_blockId_idx" ON "rooms"("blockId");

-- CreateIndex
CREATE INDEX "rooms_occupiedById_idx" ON "rooms"("occupiedById");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_blockId_roomNo_key" ON "rooms"("blockId", "roomNo");

-- CreateIndex
CREATE INDEX "equibs_condoId_idx" ON "equibs"("condoId");

-- CreateIndex
CREATE INDEX "equibs_createdById_idx" ON "equibs"("createdById");

-- CreateIndex
CREATE INDEX "equibs_status_idx" ON "equibs"("status");

-- CreateIndex
CREATE INDEX "iddirs_condoId_idx" ON "iddirs"("condoId");

-- CreateIndex
CREATE INDEX "iddirs_createdById_idx" ON "iddirs"("createdById");

-- CreateIndex
CREATE INDEX "iddirs_status_idx" ON "iddirs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_condoId_idx" ON "payments"("condoId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_monthYear_idx" ON "payments"("monthYear");

-- CreateIndex
CREATE INDEX "payments_deletedAt_idx" ON "payments"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_referenceNo_key" ON "transactions"("referenceNo");

-- CreateIndex
CREATE INDEX "transactions_senderId_idx" ON "transactions"("senderId");

-- CreateIndex
CREATE INDEX "transactions_receiverId_idx" ON "transactions"("receiverId");

-- CreateIndex
CREATE INDEX "transactions_referenceNo_idx" ON "transactions"("referenceNo");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_deletedAt_idx" ON "transactions"("deletedAt");

-- CreateIndex
CREATE INDEX "announcements_condoId_idx" ON "announcements"("condoId");

-- CreateIndex
CREATE INDEX "announcements_createdById_idx" ON "announcements"("createdById");

-- CreateIndex
CREATE INDEX "announcements_announcementType_idx" ON "announcements"("announcementType");

-- CreateIndex
CREATE INDEX "announcements_deletedAt_idx" ON "announcements"("deletedAt");

-- CreateIndex
CREATE INDEX "reports_condoId_idx" ON "reports"("condoId");

-- CreateIndex
CREATE INDEX "reports_reporterId_idx" ON "reports"("reporterId");

-- CreateIndex
CREATE INDEX "reports_assignedToId_idx" ON "reports"("assignedToId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_priority_idx" ON "reports"("priority");

-- CreateIndex
CREATE INDEX "reports_deletedAt_idx" ON "reports"("deletedAt");

-- CreateIndex
CREATE INDEX "lost_and_found_condoId_idx" ON "lost_and_found"("condoId");

-- CreateIndex
CREATE INDEX "lost_and_found_userId_idx" ON "lost_and_found"("userId");

-- CreateIndex
CREATE INDEX "lost_and_found_claimedById_idx" ON "lost_and_found"("claimedById");

-- CreateIndex
CREATE INDEX "lost_and_found_verifiedById_idx" ON "lost_and_found"("verifiedById");

-- CreateIndex
CREATE INDEX "lost_and_found_status_idx" ON "lost_and_found"("status");

-- CreateIndex
CREATE INDEX "lost_and_found_deletedAt_idx" ON "lost_and_found"("deletedAt");

-- CreateIndex
CREATE INDEX "chat_messages_condoId_idx" ON "chat_messages"("condoId");

-- CreateIndex
CREATE INDEX "chat_messages_senderId_idx" ON "chat_messages"("senderId");

-- CreateIndex
CREATE INDEX "chat_messages_receiverId_idx" ON "chat_messages"("receiverId");

-- CreateIndex
CREATE INDEX "chat_messages_isRead_idx" ON "chat_messages"("isRead");

-- CreateIndex
CREATE INDEX "chat_messages_deletedAt_idx" ON "chat_messages"("deletedAt");

-- CreateIndex
CREATE INDEX "promotions_condoId_idx" ON "promotions"("condoId");

-- CreateIndex
CREATE INDEX "promotions_postedById_idx" ON "promotions"("postedById");

-- CreateIndex
CREATE INDEX "promotions_type_idx" ON "promotions"("type");

-- CreateIndex
CREATE INDEX "promotions_isActive_idx" ON "promotions"("isActive");

-- CreateIndex
CREATE INDEX "promotions_expiresAt_idx" ON "promotions"("expiresAt");

-- CreateIndex
CREATE INDEX "promotions_deletedAt_idx" ON "promotions"("deletedAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_addToEqubById_fkey" FOREIGN KEY ("addToEqubById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_addToIddirById_fkey" FOREIGN KEY ("addToIddirById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_occupiedById_fkey" FOREIGN KEY ("occupiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equibs" ADD CONSTRAINT "equibs_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equibs" ADD CONSTRAINT "equibs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iddirs" ADD CONSTRAINT "iddirs_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iddirs" ADD CONSTRAINT "iddirs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_and_found" ADD CONSTRAINT "lost_and_found_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_and_found" ADD CONSTRAINT "lost_and_found_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_and_found" ADD CONSTRAINT "lost_and_found_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_and_found" ADD CONSTRAINT "lost_and_found_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
