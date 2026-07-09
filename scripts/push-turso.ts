// Push schema directly to Turso using raw SQL.
// Use: pnpm tsx scripts/push-turso.ts
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_TOKEN!,
  });
  const p = new PrismaClient({ adapter });

  const stmts = [
    // Drop in reverse-dependency order
    `DROP TABLE IF EXISTS "Notification"`,
    `DROP TABLE IF EXISTS "Message"`,
    `DROP TABLE IF EXISTS "Conversation"`,
    `DROP TABLE IF EXISTS "ProductImage"`,
    `DROP TABLE IF EXISTS "Product"`,
    `DROP TABLE IF EXISTS "Seller"`,
    `DROP TABLE IF EXISTS "Session"`,
    `DROP TABLE IF EXISTS "Account"`,
    `DROP TABLE IF EXISTS "VerificationToken"`,
    `DROP TABLE IF EXISTS "User"`,

    // Auth.js standard tables
    `CREATE TABLE "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT,
      "email" TEXT NOT NULL,
      "emailVerified" DATETIME,
      "image" TEXT,
      "password" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX "User_email_key" ON "User"("email")`,

    `CREATE TABLE "Account" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "provider" TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      "refresh_token" TEXT,
      "access_token" TEXT,
      "expires_at" INTEGER,
      "token_type" TEXT,
      "scope" TEXT,
      "id_token" TEXT,
      "session_state" TEXT,
      CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`,
    `CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId")`,

    `CREATE TABLE "Session" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sessionToken" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "expires" DATETIME NOT NULL,
      CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`,
    `CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken")`,

    `CREATE TABLE "VerificationToken" (
      "identifier" TEXT NOT NULL,
      "token" TEXT NOT NULL,
      "expires" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token")`,
    `CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token")`,

    // Seller
    `CREATE TABLE "Seller" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "handle" TEXT,
      "bio" TEXT,
      "category" TEXT NOT NULL DEFAULT 'Sneakers',
      "whatsappE164" TEXT NOT NULL,
      "instagramUrl" TEXT,
      "logoUrl" TEXT,
      "bannerUrl" TEXT,
      "featured" BOOLEAN NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT 1,
      "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      "ownerId" TEXT NOT NULL,
      CONSTRAINT "Seller_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`,
    `CREATE UNIQUE INDEX "Seller_slug_key" ON "Seller"("slug")`,
    `CREATE UNIQUE INDEX "Seller_ownerId_key" ON "Seller"("ownerId")`,

    // Product
    `CREATE TABLE "Product" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "price" REAL NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'PKR',
      "condition" TEXT NOT NULL,
      "category" TEXT NOT NULL DEFAULT 'Sneakers',
      "size" TEXT,
      "color" TEXT,
      "brand" TEXT,
      "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
      "featured" BOOLEAN NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      "sellerId" TEXT NOT NULL,
      CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE
    )`,

    `CREATE TABLE "ProductImage" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "url" TEXT NOT NULL,
      "alt" TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      "productId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE
    )`,

    // Conversation (1:1 per buyer+seller+product)
    `CREATE TABLE "Conversation" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "buyerId" TEXT NOT NULL,
      "sellerId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE CASCADE,
      CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE,
      CONSTRAINT "Conversation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE
    )`,
    `CREATE UNIQUE INDEX "Conversation_buyerId_sellerId_productId_key" ON "Conversation"("buyerId","sellerId","productId")`,
    `CREATE INDEX "Conversation_buyerId_idx" ON "Conversation"("buyerId")`,
    `CREATE INDEX "Conversation_sellerId_idx" ON "Conversation"("sellerId")`,

    // Message
    `CREATE TABLE "Message" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "conversationId" TEXT NOT NULL,
      "senderId" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "read" BOOLEAN NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE,
      CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`,
    `CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId","createdAt")`,

    // Notification
    `CREATE TABLE "Notification" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "kind" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "link" TEXT,
      "read" BOOLEAN NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`,
    `CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId","read","createdAt")`,
  ];

  for (const sql of stmts) {
    await p.$executeRawUnsafe(sql);
    console.log(`✓ ${sql.slice(0, 70).replace(/\s+/g, " ")}...`);
  }
  await p.$disconnect();
  console.log("\n✓ schema (re)built on Turso");
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});