import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

/**
 * /api/soundcloud/resolve?permalink=<string>
 *
 * Example: /api/soundcloud/resolve?permalink=yeat
 * This calls SoundCloud's /resolve.json to get the user's ID, kind, etc.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { permalink } = req.query;

  // 1) Ensure we have a valid 'permalink' param
  if (!permalink || typeof permalink !== "string") {
    return res
      .status(400)
      .json({ error: 'You must provide a "permalink" query param.' });
  }

  try {
    // 2) Use SoundCloud's /resolve endpoint (v1) to resolve
    //    e.g. GET https://api.soundcloud.com/resolve.json
    //         ?url=https://soundcloud.com/<permalink>
    //         &client_id=<YOUR_CLIENT_ID>
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({
        error:
          "Missing SOUNDCLOUD_CLIENT_ID in environment. Please set it in .env",
      });
    }

    // 3) Build the full URL with query params
    //    https://api.soundcloud.com/resolve.json?url=https://soundcloud.com/<permalink>&client_id=<clientId>
    const resolveUrl = "https://api.soundcloud.com/resolve.json";
    const response = await axios.get(resolveUrl, {
      params: {
        url: `https://soundcloud.com/${permalink}`,
        client_id: clientId,
      },
    });

    // 4) The response might look like:
    // {
    //   "kind": "user",
    //   "id": 295329678,
    //   "permalink": "lilyeat",
    //   ... more fields
    // }
    const resolvedData = response.data;

    // 5) Return the resolved data (it includes the user/track/playlist ID)
    return res.status(200).json(resolvedData);
  } catch (error) {
    console.error("Error resolving SoundCloud permalink:", error);
    return res.status(500).json({
      error: "Failed to resolve SoundCloud permalink. See server logs.",
    });
  }
}
