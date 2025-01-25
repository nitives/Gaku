import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Artist IDs: Yeat-295329678, SZA-312938480, Osamason-222077223
// Album IDs: SZA SOS-1928518223

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, type, include } = req.query;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Determine the type of search (albums, songs, playlists, or artist)
    const searchType =
      type === "albums"
        ? "albums"
        : type === "songs"
        ? "songs"
        : type === "playlists"
        ? "playlists"
        : type === "artist"
        ? "artist"
        : "songs";

    console.log(
      `SoundCloudKit API | ID: ${id} | Type: ${searchType} | Include: ${include}`
    );

    //
    // 1) ALBUMS → Extended track fetching
    //
    if (searchType === "albums") {
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
      const trackIdsToFetch = playlist.tracks
        .slice(5)
        .map((track: { id: number }) => track.id);

      if (trackIdsToFetch.length > 0) {
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

        // Create a map of the newly fetched tracks
        const fetchedTracksMap = new Map(
          tracksResponse.data.map((track: any) => [track.id, track])
        );
        // Reorder them to match the playlist’s original order
        const reorderedTracks = trackIdsToFetch.map((tid: number) =>
          fetchedTracksMap.get(tid)
        );
        // Replace the short track items with the full items
        playlist.tracks.splice(
          5,
          playlist.tracks.length - 5,
          ...reorderedTracks
        );
      }

      return res.status(200).json(playlist);
    }

    //
    // 2) ARTIST → Possibly fetch spotlight, latest, etc.
    //
    if (searchType === "artist") {
      // 1. Basic artist info
      const artistResponse = await axios.get(
        `https://api-v2.soundcloud.com/users/${id}`,
        {
          headers: {
            Host: "api-v2.soundcloud.com",
            Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
          },
        }
      );
      const artist = artistResponse.data;

      // 2. Parse `include` for multiple includes (comma-separated)
      const includes = (include ?? "").toString().split(",");

      // 3. If "spotlight" included → fetch the user’s spotlight
      if (includes.includes("spotlight")) {
        const spotlightResponse = await axios.get(
          `https://api-v2.soundcloud.com/users/${id}/spotlight`,
          {
            headers: {
              Host: "api-v2.soundcloud.com",
              Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
            },
          }
        );

        // Example: attach processed spotlight data to artist
        const tracks = spotlightResponse.data.collection || [];
        artist.spotlight = tracks.map((track: any) => ({
          ...track,
          artwork_url_hd: track.artwork_url
            ? track.artwork_url.replace("large", "t500x500")
            : null,
        }));
      }

      // 4. If "latest" included → fetch user’s “latest” from /stream/users/{id}
      if (includes.includes("latest")) {
        const latestResponse = await axios.get(
          `https://api-v2.soundcloud.com/stream/users/${id}`,
          {
            headers: {
              Host: "api-v2.soundcloud.com",
              Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
            },
          }
        );

        // Example: attach processed “latest” data to artist
        const tracks = latestResponse.data.collection || [];
        artist.latest = tracks.map((track: any) => {
          const trackData = track.track || track;
          return {
            ...track,
            track: {
              ...trackData,
              artwork_url_hd: trackData.artwork_url
                ? trackData.artwork_url.replace("large", "t500x500")
                : null,
            },
          };
        });
      }

      return res.status(200).json(artist);
    }

    //
    // 3) SONGS or PLAYLISTS → direct fetch
    //
    const urlDetails =
      {
        songs: `/tracks/${id}`,
        playlists: `/playlists/${id}`,
      }[searchType] || `/tracks/${id}`;

    const response = await axios.get(
      `https://api-v2.soundcloud.com${urlDetails}`,
      {
        headers: {
          Host: "api-v2.soundcloud.com",
          Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("SoundCloudKit API | Error:", error);
    return res.status(500).json({
      error: "An error occurred while fetching SoundCloud data | SoundCloudKit",
    });
  }
}
