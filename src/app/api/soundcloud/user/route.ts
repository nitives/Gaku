import { json, badRequest, error, withErrorHandling } from "@/lib/api/respond";
import { scAuth } from "@/lib/config";
import { dev } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const { CLIENT_ID } = await scAuth();
  const profileUrl = searchParams.get("profileUrl");
  const type = searchParams.get("type");

  if (!profileUrl) return badRequest("Profile URL (or user ID) is required");

  const clientID = CLIENT_ID || process.env.SOUNDCLOUD_CLIENT_ID;
  if (!clientID) return error("Missing SoundCloud credentials", 500);
  dev.log("| [SOUNDCLOUD] | Using Client ID:", clientID);
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

  let userData = resolvedUserData;
  if (!userData) {
    const userRes = await fetch(
      `https://api-v2.soundcloud.com/users/${userId}?client_id=${clientID}`,
      { headers, cache: "no-store" },
    );
    if (!userRes.ok) return error("Failed to fetch user data", 502);
    userData = await userRes.json();
  }

  // Paginate through all likes pages
  const allLikes: unknown[] = [];
  let nextUrl: string | null =
    `https://api-v2.soundcloud.com/users/${userId}/likes?client_id=${clientID}&limit=200`;

  while (nextUrl) {
    // Append client_id if missing (next_href may omit it)
    const pageUrl: string = nextUrl.includes("client_id=")
      ? nextUrl
      : `${nextUrl}&client_id=${clientID}`;
    const res: Response = await fetch(pageUrl, { headers, cache: "no-store" });
    if (!res.ok) break;
    const page: { collection: unknown[]; next_href?: string | null } =
      await res.json();
    if (Array.isArray(page.collection)) allLikes.push(...page.collection);
    nextUrl = page.next_href ?? null;
  }

  const userLikes = { collection: allLikes };
  return json({ userData, userLikes });
});
