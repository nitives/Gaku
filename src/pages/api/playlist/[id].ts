import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const playlistResponse = await axios.get(
        `https://api-v2.soundcloud.com/playlists/${id}`,
        {
          headers: {
            Host: "api-v2.soundcloud.com",
            Authorization: "OAuth 2-295088-300743603-2XEAimWph2HxCZ",
          },
        }
      );

      const playlist = playlistResponse.data;

      // Get the IDs of tracks that need more details
      const trackIdsToFetch = playlist.tracks
        .slice(5)
        .map((track: { id: any }) => track.id)
        .join(",");

      if (trackIdsToFetch) {
        const tracksResponse = await axios.get(
          `https://api-v2.soundcloud.com/tracks?ids=${trackIdsToFetch}`,
          {
            headers: {
              Host: "api-v2.soundcloud.com",
              Authorization: "OAuth 2-295088-300743603-2XEAimWph2HxCZ",
            },
          }
        );

        // Replace the simplified track objects with full track details
        playlist.tracks.splice(
          5,
          playlist.tracks.length - 5,
          ...tracksResponse.data
        );
      }

      res.status(200).json(playlist);
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while fetching the playlist" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
