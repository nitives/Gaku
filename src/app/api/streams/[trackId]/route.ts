import { NextResponse } from "next/server";
import { SoundCloudKit } from "@/lib/audio/fetchers";

export async function GET(
  req: Request,
  { params }: { params: { trackId: string } }
) {
  // Note: `await params` is incorrect; params is not a Promise. Fix this by removing `await`.
  const { trackId } = await params; // Correct destructuring

  try {
    const songData = await SoundCloudKit.getData(trackId, "songs");
    const transcodingUrl = songData.media.transcodings.find(
      (t: any) => t.format.protocol === "hls"
    )?.url;

    if (!transcodingUrl) {
      throw new Error("No HLS transcoding URL found");
    }

    // Ensure API key and client_id are available
    const apiKey = process.env.SOUNDCLOUD_API_KEY;
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    if (!apiKey || !clientId) {
      throw new Error(
        "SoundCloud API key or client ID is not configured in environment variables"
      );
    }

    // Fetch with Authorization header and client_id query parameter
    const response = await fetch(`${transcodingUrl}?client_id=${clientId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error(
        `Fetch failed with status: ${response.status}`,
        await response.text()
      );
      throw new Error("Failed to fetch m3u8 URL");
    }

    const data = await response.json();
    return NextResponse.json({ url: data.url }, { status: 200 });
  } catch (err) {
    console.error(`Error fetching stream URL for track ${trackId}:`, err);
    return NextResponse.json(
      { error: "Could not retrieve stream URL" },
      { status: 500 }
    );
  }
}
