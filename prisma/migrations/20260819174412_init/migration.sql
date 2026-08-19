-- CreateEnum
CREATE TYPE "Role" AS ENUM ('resident', 'condo_admin', 'guard', 'super_admin');

-- CreateEnum
CREATE TYPE "RoomModel" AS ENUM ('studio', 'one_bedroom', 'two_bedroom', 'three_bedroom');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('free', 'occupied', 'reserved');

-- CreateEnum
CREATE TYPE "EqubStatus" AS ENUM ('pending', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "EqubMemberStatus" AS ENUM ('active', 'inactive', 'suspended', 'winner');

-- CreateEnum
CREATE TYPE "EqubPayoutStatus" AS ENUM ('pending', 'selected', 'processing', 'paid', 'failed');

-- CreateEnum
CREATE TYPE "IddirStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "IddirMemberStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "ActiveInactiveStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('iddir', 'equb', 'guard_fee', 'service_charge', 'other');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cbe', 'telebirr', 'cash', 'bank_transfer', 'others');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'completed', 'failed', 'reversed');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('bank', 'mobile_money', 'wallet');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'inactive', 'blocked');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('hx');

-- CreateEnum
CREATE TYPE "ServiceFeeStatus" AS ENUM ('pending', 'collected', 'refunded');

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
CREATE TYPE "PromoStatus" AS ENUM ('pending', 'approved', 'active', 'expired', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('shop', 'technical', 'service', 'product', 'event', 'other');

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
    "noMembers" INTEGER NOT NULL DEFAULT 0,
    "status" "EqubStatus" NOT NULL DEFAULT 'pending',
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "contributionAmount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "equibs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equb_members" (
    "id" TEXT NOT NULL,
    "condoId" TEXT,
    "equbId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "EqubMemberStatus" NOT NULL DEFAULT 'active',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "totalPaid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "hasReceivedPayout" BOOLEAN NOT NULL DEFAULT false,
    "payoutCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equb_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equb_payouts" (
    "id" TEXT NOT NULL,
    "equbId" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "selectionReference" TEXT NOT NULL,
    "status" "EqubPayoutStatus" NOT NULL DEFAULT 'pending',
    "selectedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equb_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iddirs" (
    "id" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "noMembers" INTEGER NOT NULL DEFAULT 0,
    "status" "IddirStatus" NOT NULL DEFAULT 'active',
    "startedDate" TIMESTAMP(3) NOT NULL,
    "contributionAmount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "iddirs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iddir_members" (
    "id" TEXT NOT NULL,
    "iddirId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "IddirMemberStatus" NOT NULL DEFAULT 'active',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "totalPaid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalReceived" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iddir_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "providerName" TEXT,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "AccountStatus" NOT NULL DEFAULT 'active',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condo_accounts" (
    "id" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "providerName" TEXT,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "AccountStatus" NOT NULL DEFAULT 'active',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "condo_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HXAccount" (
    "id" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "serviceFeePercentage" DECIMAL(5,2) NOT NULL DEFAULT 0.34,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HXAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "equbId" TEXT,
    "iddirId" TEXT,
    "paymentType" "PaymentType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "serviceFee" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "monthYear" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "transactionId" TEXT,
    "receiptUrl" TEXT,
    "paymentDate" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "approvedById" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "senderId" TEXT,
    "senderAccountId" TEXT,
    "senderCondoAccountId" TEXT,
    "senderAccNo" TEXT,
    "senderName" TEXT,
    "receiverId" TEXT,
    "receiverAccountId" TEXT,
    "receiverCondoAccountId" TEXT,
    "hxAccountId" TEXT,
    "receiverAccNo" TEXT,
    "receiverName" TEXT,
    "referenceNo" TEXT NOT NULL,
    "stamp" TEXT,
    "paymentType" "PaymentType",
    "amount" DECIMAL(15,2) NOT NULL,
    "monthYear" TEXT,
    "paymentMethod" "PaymentMethod",
    "gateway" "PaymentGateway" NOT NULL DEFAULT 'hx',
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "condoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_fees" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "condoId" TEXT NOT NULL,
    "hxAccountId" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "baseAmount" DECIMAL(15,2) NOT NULL,
    "feeAmount" DECIMAL(15,2) NOT NULL,
    "status" "ServiceFeeStatus" NOT NULL DEFAULT 'pending',
    "collectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_fees_pkey" PRIMARY KEY ("id")
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
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "PromoType" NOT NULL,
    "category" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "status" "PromoStatus" NOT NULL DEFAULT 'pending',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "businessName" TEXT NOT NULL DEFAULT 'Unknown Business',
    "contactPerson" TEXT,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT,
    "websiteUrl" TEXT,
    "imageUrl" TEXT,
    "additionalImages" TEXT[],
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "condoId" TEXT,
    "postedById" TEXT NOT NULL,
    "postedByRole" "CreatorRole",
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_responses" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isAdminResponse" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_responses_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "equb_members_equbId_idx" ON "equb_members"("equbId");

-- CreateIndex
CREATE INDEX "equb_members_userId_idx" ON "equb_members"("userId");

-- CreateIndex
CREATE INDEX "equb_members_status_idx" ON "equb_members"("status");

-- CreateIndex
CREATE UNIQUE INDEX "equb_members_equbId_userId_key" ON "equb_members"("equbId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "equb_payouts_selectionReference_key" ON "equb_payouts"("selectionReference");

-- CreateIndex
CREATE UNIQUE INDEX "equb_payouts_transactionId_key" ON "equb_payouts"("transactionId");

-- CreateIndex
CREATE INDEX "equb_payouts_equbId_idx" ON "equb_payouts"("equbId");

-- CreateIndex
CREATE INDEX "equb_payouts_winnerId_idx" ON "equb_payouts"("winnerId");

-- CreateIndex
CREATE INDEX "equb_payouts_status_idx" ON "equb_payouts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "equb_payouts_equbId_roundNumber_key" ON "equb_payouts"("equbId", "roundNumber");

-- CreateIndex
CREATE INDEX "iddirs_condoId_idx" ON "iddirs"("condoId");

-- CreateIndex
CREATE INDEX "iddirs_createdById_idx" ON "iddirs"("createdById");

-- CreateIndex
CREATE INDEX "iddirs_status_idx" ON "iddirs"("status");

-- CreateIndex
CREATE INDEX "iddir_members_iddirId_idx" ON "iddir_members"("iddirId");

-- CreateIndex
CREATE INDEX "iddir_members_userId_idx" ON "iddir_members"("userId");

-- CreateIndex
CREATE INDEX "iddir_members_status_idx" ON "iddir_members"("status");

-- CreateIndex
CREATE UNIQUE INDEX "iddir_members_iddirId_userId_key" ON "iddir_members"("iddirId", "userId");

-- CreateIndex
CREATE INDEX "user_accounts_userId_idx" ON "user_accounts"("userId");

-- CreateIndex
CREATE INDEX "user_accounts_paymentMethod_idx" ON "user_accounts"("paymentMethod");

-- CreateIndex
CREATE INDEX "user_accounts_status_idx" ON "user_accounts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_userId_accountNumber_key" ON "user_accounts"("userId", "accountNumber");

-- CreateIndex
CREATE INDEX "condo_accounts_condoId_idx" ON "condo_accounts"("condoId");

-- CreateIndex
CREATE INDEX "condo_accounts_paymentMethod_idx" ON "condo_accounts"("paymentMethod");

-- CreateIndex
CREATE INDEX "condo_accounts_status_idx" ON "condo_accounts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "condo_accounts_condoId_accountNumber_key" ON "condo_accounts"("condoId", "accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "HXAccount_accountNumber_key" ON "HXAccount"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_condoId_idx" ON "payments"("condoId");

-- CreateIndex
CREATE INDEX "payments_equbId_idx" ON "payments"("equbId");

-- CreateIndex
CREATE INDEX "payments_iddirId_idx" ON "payments"("iddirId");

-- CreateIndex
CREATE INDEX "payments_paymentType_idx" ON "payments"("paymentType");

-- CreateIndex
CREATE INDEX "payments_paymentMethod_idx" ON "payments"("paymentMethod");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_monthYear_idx" ON "payments"("monthYear");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_referenceNo_key" ON "transactions"("referenceNo");

-- CreateIndex
CREATE INDEX "transactions_senderId_idx" ON "transactions"("senderId");

-- CreateIndex
CREATE INDEX "transactions_receiverId_idx" ON "transactions"("receiverId");

-- CreateIndex
CREATE INDEX "transactions_senderAccountId_idx" ON "transactions"("senderAccountId");

-- CreateIndex
CREATE INDEX "transactions_senderCondoAccountId_idx" ON "transactions"("senderCondoAccountId");

-- CreateIndex
CREATE INDEX "transactions_receiverAccountId_idx" ON "transactions"("receiverAccountId");

-- CreateIndex
CREATE INDEX "transactions_receiverCondoAccountId_idx" ON "transactions"("receiverCondoAccountId");

-- CreateIndex
CREATE INDEX "transactions_condoId_idx" ON "transactions"("condoId");

-- CreateIndex
CREATE INDEX "transactions_referenceNo_idx" ON "transactions"("referenceNo");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_paymentMethod_idx" ON "transactions"("paymentMethod");

-- CreateIndex
CREATE INDEX "transactions_paymentType_idx" ON "transactions"("paymentType");

-- CreateIndex
CREATE UNIQUE INDEX "service_fees_transactionId_key" ON "service_fees"("transactionId");

-- CreateIndex
CREATE INDEX "service_fees_userId_idx" ON "service_fees"("userId");

-- CreateIndex
CREATE INDEX "service_fees_condoId_idx" ON "service_fees"("condoId");

-- CreateIndex
CREATE INDEX "service_fees_hxAccountId_idx" ON "service_fees"("hxAccountId");

-- CreateIndex
CREATE INDEX "service_fees_status_idx" ON "service_fees"("status");

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
CREATE INDEX "promotions_status_idx" ON "promotions"("status");

-- CreateIndex
CREATE INDEX "promotions_isActive_idx" ON "promotions"("isActive");

-- CreateIndex
CREATE INDEX "promotions_expiresAt_idx" ON "promotions"("expiresAt");

-- CreateIndex
CREATE INDEX "promotions_type_idx" ON "promotions"("type");

-- CreateIndex
CREATE INDEX "promotions_condoId_idx" ON "promotions"("condoId");

-- CreateIndex
CREATE INDEX "promotions_postedById_idx" ON "promotions"("postedById");

-- CreateIndex
CREATE INDEX "promotions_deletedAt_idx" ON "promotions"("deletedAt");

-- CreateIndex
CREATE INDEX "report_responses_reportId_idx" ON "report_responses"("reportId");

-- CreateIndex
CREATE INDEX "report_responses_userId_idx" ON "report_responses"("userId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_addToEqubById_fkey" FOREIGN KEY ("addToEqubById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_addToIddirById_fkey" FOREIGN KEY ("addToIddirById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "equb_members" ADD CONSTRAINT "equb_members_equbId_fkey" FOREIGN KEY ("equbId") REFERENCES "equibs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equb_members" ADD CONSTRAINT "equb_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equb_payouts" ADD CONSTRAINT "equb_payouts_equbId_fkey" FOREIGN KEY ("equbId") REFERENCES "equibs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equb_payouts" ADD CONSTRAINT "equb_payouts_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equb_payouts" ADD CONSTRAINT "equb_payouts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equb_payouts" ADD CONSTRAINT "equb_payouts_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iddirs" ADD CONSTRAINT "iddirs_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iddirs" ADD CONSTRAINT "iddirs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iddir_members" ADD CONSTRAINT "iddir_members_iddirId_fkey" FOREIGN KEY ("iddirId") REFERENCES "iddirs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iddir_members" ADD CONSTRAINT "iddir_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condo_accounts" ADD CONSTRAINT "condo_accounts_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_equbId_fkey" FOREIGN KEY ("equbId") REFERENCES "equibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_iddirId_fkey" FOREIGN KEY ("iddirId") REFERENCES "iddirs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_senderAccountId_fkey" FOREIGN KEY ("senderAccountId") REFERENCES "user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_senderCondoAccountId_fkey" FOREIGN KEY ("senderCondoAccountId") REFERENCES "condo_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_receiverAccountId_fkey" FOREIGN KEY ("receiverAccountId") REFERENCES "user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_receiverCondoAccountId_fkey" FOREIGN KEY ("receiverCondoAccountId") REFERENCES "condo_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_hxAccountId_fkey" FOREIGN KEY ("hxAccountId") REFERENCES "HXAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_fees" ADD CONSTRAINT "service_fees_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_fees" ADD CONSTRAINT "service_fees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_fees" ADD CONSTRAINT "service_fees_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_fees" ADD CONSTRAINT "service_fees_hxAccountId_fkey" FOREIGN KEY ("hxAccountId") REFERENCES "HXAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_condoId_fkey" FOREIGN KEY ("condoId") REFERENCES "condos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_responses" ADD CONSTRAINT "report_responses_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_responses" ADD CONSTRAINT "report_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
