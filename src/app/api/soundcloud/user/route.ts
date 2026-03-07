import { json, badRequest, error, withErrorHandling } from "@/lib/api/respond";
import { scAuth } from "@/lib/config";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const { CLIENT_ID } = await scAuth();
  const profileUrl = searchParams.get("profileUrl");
  const type = searchParams.get("type");

  if (!profileUrl) return badRequest("Profile URL (or user ID) is required");

  const clientID = CLIENT_ID || process.env.SOUNDCLOUD_CLIENT_ID;
  if (!clientID) return error("Missing SoundCloud credentials", 500);

  const headers = {
    Host: "api-v2.soundcloud.com",
    // Authorization: `OAuth ${apiKey}`,
  } as Record<string, string>;

  let userId: string | null = null;
  let resolvedUserData: unknown = null;
  if (type === "id") {
    userId = profileUrl;
  } else {
    const resolveRes = await fetch(
      `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(profileUrl)}&client_id=${clientID}`,
      { headers, cache: "no-store" },
    );
    if (!resolveRes.ok)
      return error("Failed to resolve SoundCloud profile", 502);
    const resolved = await resolveRes.json();
    userId = resolved?.id ? String(resolved.id) : null;
    if (!userId) return error("User ID not found in resolve response", 404);
    resolvedUserData = resolved; // reuse resolved data, skip extra /users fetch
  }

  const likesRes = await fetch(
    `https://api-v2.soundcloud.com/users/${userId}/likes?client_id=${clientID}&limit=500&offset=0`,
    { headers, cache: "no-store" },
  );
  if (!likesRes.ok) return error("Failed to fetch user likes", 502);

  let userData = resolvedUserData;
  if (!userData) {
    const userRes = await fetch(
      `https://api-v2.soundcloud.com/users/${userId}?client_id=${clientID}`,
      { headers, cache: "no-store" },
    );
    if (!userRes.ok) return error("Failed to fetch user data", 502);
    userData = await userRes.json();
  }

  const userLikes = await likesRes.json();
  return json({ userData, userLikes });
});
