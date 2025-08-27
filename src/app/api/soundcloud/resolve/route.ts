import { json, badRequest, error, withErrorHandling } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const permalink = searchParams.get("permalink");
  if (!permalink)
    return badRequest('You must provide a "permalink" query param.');

  const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
  if (!clientId)
    return error("Missing SOUNDCLOUD_CLIENT_ID in environment.", 500);

  const resolveUrl = "https://api.soundcloud.com/resolve.json";
  const response = await fetch(
    `${resolveUrl}?url=${encodeURIComponent(
      `https://soundcloud.com/${permalink}`
    )}&client_id=${clientId}`,
    { cache: "no-store" }
  );
  if (!response.ok)
    return error("Failed to resolve SoundCloud permalink.", 502);
  const data = await response.json();
  return json(data);
});
