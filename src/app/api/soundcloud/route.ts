import { json, error, withErrorHandling } from "@/lib/api/respond";
import { SEARCH_PAGE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.SOUNDCLOUD_API_KEY;
  if (!apiKey) return error("Missing SOUNDCLOUD_API_KEY", 500);

  const url = new URL("https://api-v2.soundcloud.com/search");
  searchParams.forEach((v, k) => url.searchParams.set(k, v));
  url.searchParams.set("facet", "model");
  url.searchParams.set("limit", String(SEARCH_PAGE.FULL.LIMIT));
  url.searchParams.set("offset", String(SEARCH_PAGE.FULL.OFFSET));

  const res = await fetch(url, {
    headers: { Authorization: `OAuth ${apiKey}` },
    cache: "no-store",
  });
  if (!res.ok) return error("Failed to fetch SoundCloud search", 502);
  return json(await res.json());
});
