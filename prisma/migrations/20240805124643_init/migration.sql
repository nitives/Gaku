-- CreateTable
CREATE TABLE "Library" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "songs" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Library_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Library_key_key" ON "Library"("key");
