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
            Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
          },
        }
      );

      const playlist = playlistResponse.data;
      // console.log("API Playlist | playlist", playlist);

      // Get the IDs of tracks that need more details in the correct order
      const trackIdsToFetch = playlist.tracks
        .slice(5)
        .map((track: { id: any }) => track.id);

      // console.log("API Playlist | Full Length:", playlist.tracks.length);
      // console.log("API Playlist | Tracks:", playlist.tracks);
      // console.log("API Playlist | trackIdsToFetch:", trackIdsToFetch.join(","));

      if (trackIdsToFetch.length > 0) {
        // Fetch details for the remaining tracks
        const tracksResponse = await axios.get(
          `https://api-v2.soundcloud.com/tracks?ids=${trackIdsToFetch.join(
            ","
          )}`,
          {
            headers: {
              Host: "api-v2.soundcloud.com",
              Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
            },
          }
        );

        // Create a map of the fetched tracks by ID
        const fetchedTracksMap = new Map(
          tracksResponse.data.map((track: any) => [track.id, track])
        );

        // Reorder the fetched tracks according to the original playlist order
        const reorderedTracks = trackIdsToFetch.map((id: any) =>
          fetchedTracksMap.get(id)
        );

        // Replace the simplified track objects with full track details in the correct order
        playlist.tracks.splice(
          5,
          playlist.tracks.length - 5,
          ...reorderedTracks
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
