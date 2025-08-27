import { json, badRequest, error, withErrorHandling } from "@/lib/api/respond";

const MUSIX_API_KEY = process.env.MUSIX_API_KEY;

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: Request) => {
  if (!MUSIX_API_KEY) return error("Missing MUSIX_API_KEY", 500);
  const { searchParams } = new URL(request.url);
  const isrc = searchParams.get("isrc");
  if (!isrc) return badRequest("Missing isrc parameter");
  const res = await fetch(
    `http://api.musixmatch.com/ws/1.1/track.get?track_isrc=${encodeURIComponent(
      isrc
    )}&format=json&apikey=${MUSIX_API_KEY}`,
    { cache: "no-store" }
  );
  if (!res.ok) return error("Failed to fetch track data", 502);
  return json(await res.json());
});
