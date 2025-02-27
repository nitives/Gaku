import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get or create library function
  const getOrCreateLibrary = async () => {
    const library =
      (await prisma.library.findFirst({
        where: { userId },
      })) ||
      (await prisma.library.create({
        data: {
          userId,
          key: Math.random().toString(36).substring(2, 15),
        },
      }));
    return library;
  };

  // GET: Retrieve user's library songs
  if (req.method === "GET") {
    try {
      const library = await getOrCreateLibrary();
      const libraryWithSongs = await prisma.library.findUnique({
        where: { id: library.id },
        include: { songs: true },
      });
      return res.status(200).json(libraryWithSongs?.songs || []);
    } catch (error) {
      console.error("Error fetching library:", error);
      return res.status(500).json({ error: "Failed to retrieve library" });
    }
  }

  // POST: Add song to library
  else if (req.method === "POST") {
    try {
      const { soundcloudId } = req.body;
      if (!soundcloudId) {
        return res.status(400).json({ error: "SoundCloud ID is required" });
      }

      const library = await getOrCreateLibrary();

      // Create song if it doesn't exist and add to library
      await prisma.$transaction(async (tx) => {
        // Try to create the song (if it exists, this will be skipped)
        await tx.song.upsert({
          where: { id: soundcloudId },
          update: {}, // No updates if it exists
          create: { id: soundcloudId },
        });

        // Add song to library
        await tx.library.update({
          where: { id: library.id },
          data: {
            songs: {
              connect: { id: soundcloudId },
            },
          },
        });
      });

      return res
        .status(200)
        .json({ success: true, message: "Song added to library" });
    } catch (error) {
      console.error("Error adding song:", error);
      return res.status(500).json({ error: "Failed to add song to library" });
    }
  }

  // DELETE: Remove song from library
  else if (req.method === "DELETE") {
    try {
      const { soundcloudId } = req.body;
      if (!soundcloudId) {
        return res.status(400).json({ error: "SoundCloud ID is required" });
      }

      const library = await getOrCreateLibrary();

      // Remove song from library (not from database)
      await prisma.library.update({
        where: { id: library.id },
        data: {
          songs: {
            disconnect: { id: soundcloudId },
          },
        },
      });

      return res
        .status(200)
        .json({ success: true, message: "Song removed from library" });
    } catch (error) {
      console.error("Error removing song:", error);
      return res
        .status(500)
        .json({ error: "Failed to remove song from library" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
