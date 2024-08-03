import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const response = await axios.get(
        `https://api-v2.soundcloud.com/users/${id}/spotlight`,
        {
          headers: {
            Host: "api-v2.soundcloud.com",
            Authorization: "OAuth 2-295088-300743603-2XEAimWph2HxCZ",
          },
        }
      );

      res.status(200).json(response.data);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while fetching the artist's spotlight tracks" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
