import { json, badRequest, error, withErrorHandling } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const trackUrl = searchParams.get("trackUrl");
  if (!trackUrl) return badRequest("Missing trackUrl parameter");

  const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
  if (!clientId) return error("Missing SOUNDCLOUD_CLIENT_ID", 500);

  // Step 1: Resolve track to ID
  const trackApiUrl = `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(
    trackUrl
  )}&client_id=${clientId}`;
  const trackResponse = await fetch(trackApiUrl, { cache: "no-store" });
  if (!trackResponse.ok) return error("Failed to resolve track URL", 502);
  const resolved = await trackResponse.json();
  const trackId = resolved.id;

  // Step 2: Fetch track details
  const trackDetailsUrl = `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${clientId}`;
  const detailsResponse = await fetch(trackDetailsUrl, { cache: "no-store" });
  if (!detailsResponse.ok) return error("Failed to fetch track details", 502);
  const details = await detailsResponse.json();
  const transcodings = details.media?.transcodings ?? [];

  const hls = transcodings.find((t: any) => t.format?.protocol === "hls");
  if (!hls) return error("HLS transcoding not found", 404);

  // Step 4: Get HLS playlist URL
  const hlsUrl = `${hls.url}?client_id=${clientId}`;
  const hlsResponse = await fetch(hlsUrl, { cache: "no-store" });
  if (!hlsResponse.ok) return error("Failed to fetch HLS URL", 502);
  const hlsData = await hlsResponse.json();
  return json({ playlistUrl: hlsData.url });
});
