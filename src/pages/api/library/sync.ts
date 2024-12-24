import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      const { key } = req.query;

      if (!key || typeof key !== "string") {
        // console.log("Invalid key:", key);
        return res.status(400).json({ error: "Invalid key provided" });
      }

      try {
        // console.log("Key:", key);
        const library = await prisma.library.findUnique({
          where: { key: key },
        });
        // console.log("library done");
        if (library) {
          res.status(200).json({
            key: library.key,
            name: library.name,
            songs: JSON.parse(library.songs),
          });
          // console.log("library done 2");
        } else {
          res.status(200).json(null); // No library found
          console.warn("Library not found");
        }
      } catch (error) {
        console.error("Library error");
        res.status(500).json({ error: "Error fetching library" });
      }
      break;

    case "POST":
      const { key: postKey, name, songs } = req.body;

      try {
        const library = await prisma.library.upsert({
          where: { key: postKey },
          update: { name, songs: JSON.stringify(songs) },
          create: { key: postKey, name, songs: JSON.stringify(songs) },
        });

        res.status(200).json(library);
      } catch (error) {
        res.status(500).json({ error: "Error syncing library" });
      }
      break;

    case "DELETE":
      const { key: deleteKey } = req.query;

      if (!deleteKey || typeof deleteKey !== "string") {
        return res.status(400).json({ error: "Invalid key provided" });
      }

      try {
        await prisma.library.delete({
          where: { key: deleteKey },
        });
        res.status(200).json({ message: "Library deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Error deleting library" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
