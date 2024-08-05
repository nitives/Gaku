import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { key, songs } = req.body;

    try {
      const library = await prisma.library.upsert({
        where: { key },
        update: { songs: JSON.stringify(songs) },
        create: { key, songs: JSON.stringify(songs) },
      });

      res.status(200).json(library);
    } catch (error) {
      res.status(500).json({ error: "Error syncing library" });
    }
  } else if (req.method === "GET") {
    const { key } = req.query;

    try {
      const library = await prisma.library.findUnique({
        where: { key: key as string },
      });

      if (library) {
        res.status(200).json({
          key: library.key,
          songs: JSON.parse(library.songs),
        });
      } else {
        res.status(404).json({ error: "Library not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching library" });
    }
  } else if (req.method === "DELETE") {
    const { key } = req.query;

    try {
      await prisma.library.delete({
        where: { key: key as string },
      });

      res.status(200).json({ message: "Library deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting library" });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
