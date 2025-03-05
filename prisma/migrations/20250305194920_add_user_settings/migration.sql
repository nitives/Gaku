-- AlterTable
ALTER TABLE "Library" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Playlist" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Song" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "_LibraryToSong" ADD CONSTRAINT "_LibraryToSong_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_LibraryToSong_AB_unique";

-- AlterTable
ALTER TABLE "_PlaylistToSong" ADD CONSTRAINT "_PlaylistToSong_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PlaylistToSong_AB_unique";

-- AlterTable
ALTER TABLE "_UserLikedSongs" ADD CONSTRAINT "_UserLikedSongs_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UserLikedSongs_AB_unique";

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "themeColor" TEXT NOT NULL DEFAULT '#5891fa',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
