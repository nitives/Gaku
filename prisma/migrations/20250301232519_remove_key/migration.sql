/*
  Warnings:

  - You are about to drop the column `key` on the `Library` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Library_key_key";

-- AlterTable
ALTER TABLE "Library" DROP COLUMN "key";
