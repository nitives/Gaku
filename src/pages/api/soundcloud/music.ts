import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { trackUrl } = req.query;
    try {
      // Step 1: Extract the track ID
      const trackApiUrl = `https://api-v2.soundcloud.com/resolve?url=${trackUrl}&client_id=${process.env.SOUNDCLOUD_CLIENT_ID}`;
      const trackResponse = await axios.get(trackApiUrl);
      const trackId = trackResponse.data.id;

      // Step 2: Fetch track details
      const trackDetailsUrl = `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${process.env.SOUNDCLOUD_CLIENT_ID}`;
      const trackDetailsResponse = await axios.get(trackDetailsUrl);
      const transcodings = trackDetailsResponse.data.media.transcodings;

      // console.log("transcodings:", transcodings);

      // Step 3: Find HLS transcoding
      const hlsTranscoding = transcodings.find(
        (transcoding: { format: { protocol: string } }) =>
          transcoding.format.protocol === "hls"
      );
      if (!hlsTranscoding) {
        throw new Error("HLS transcoding not found");
      }

      // Step 4: Get HLS playlist URL
      const hlsUrl = `${hlsTranscoding.url}?client_id=${process.env.SOUNDCLOUD_CLIENT_ID}`;
      const hlsResponse = await axios.get(hlsUrl);
      const playlistUrl = hlsResponse.data.url;

      res.status(200).json({ playlistUrl });
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
