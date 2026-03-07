import { json, error, withErrorHandling } from "@/lib/api/respond";
import { scAuth } from "@/lib/config";
import { SEARCH_PAGE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const { CLIENT_ID } = await scAuth();
  const client = CLIENT_ID || process.env.SOUNDCLOUD_CLIENT_ID;
  const clientIdQuery = `?client_id=${client}`;
  if (!client) return error("Missing SOUNDCLOUD_CLIENT_ID", 500);

  const url = new URL("https://api-v2.soundcloud.com/search");
  searchParams.forEach((v, k) => url.searchParams.set(k, v));
  url.searchParams.set("facet", "model");
  url.searchParams.set("limit", String(SEARCH_PAGE.FULL.LIMIT));
  url.searchParams.set("offset", String(SEARCH_PAGE.FULL.OFFSET));
  url.searchParams.set("client_id", client);

  const res = await fetch(url, {
    cache: "no-store",
  });
  if (!res.ok) return error("Failed to fetch SoundCloud search", 502);
  return json(await res.json());
});
