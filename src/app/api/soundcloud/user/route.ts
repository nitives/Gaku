import { json, badRequest, error, withErrorHandling } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const profileUrl = searchParams.get("profileUrl");
  const type = searchParams.get("type");

  if (!profileUrl) return badRequest("Profile URL (or user ID) is required");

  const apiKey = process.env.SOUNDCLOUD_API_KEY;
  const clientID = process.env.SOUNDCLOUD_CLIENT_ID;
  if (!apiKey || !clientID) return error("Missing SoundCloud credentials", 500);

  const headers = {
    Host: "api-v2.soundcloud.com",
    Authorization: `OAuth ${apiKey}`,
  } as Record<string, string>;

  let userId: string | null = null;
  if (type === "id") {
    userId = profileUrl;
  } else {
    const pageRes = await fetch(profileUrl, { cache: "no-store" });
    if (!pageRes.ok) return error("Failed to fetch profile page", 502);
    const html = await pageRes.text();
    const match = html.match(
      /<meta property=['"]twitter:app:url:googleplay['"] content=['"][^"']*users:(\d+)['"]/
    );
    userId = match?.[1] ?? null;
    if (!userId) return error("User ID not found in the content", 404);
  }

  const [userRes, likesRes] = await Promise.all([
    fetch(`https://api-v2.soundcloud.com/users/${userId}`, {
      headers,
      cache: "no-store",
    }),
    fetch(
      `https://api-v2.soundcloud.com/users/${userId}/likes?client_id=${clientID}&limit=500&offset=0`,
      { headers, cache: "no-store" }
    ),
  ]);
  if (!userRes.ok) return error("Failed to fetch user data", 502);
  if (!likesRes.ok) return error("Failed to fetch user likes", 502);
  const userData = await userRes.json();
  const userLikes = await likesRes.json();
  return json({ userData, userLikes });
});
