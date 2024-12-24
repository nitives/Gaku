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
            Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
          },
        }
      );

      const tracks = response.data.collection;

      // Modify artwork_url to get the HD version
      const updatedTracks = tracks.map((track: any) => {
        const artwork_url_hd = track.artwork_url
          ? track.artwork_url.replace("large", "t500x500")
          : null;
        return {
          ...track,
          artwork_url_hd,
        };
      });

      res.status(200).json({ ...response.data, collection: updatedTracks });
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while fetching the artist's spotlight tracks",
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
