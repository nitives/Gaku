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
      try {
        console.log("Key:", key);
        const library = await prisma.library.findUnique({
          where: { key: key as string },
        });
        console.log("library done");
        if (library) {
          res.status(200).json({
            key: library.key,
            name: library.name,
            songs: JSON.parse(library.songs),
          });
          console.log("library done 2");
        } else {
          res.status(200).json(null); // No library found
          console.log("library else");
        }
      } catch (error) {
        console.log("library error");
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

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
