import { json, badRequest, error, withErrorHandling } from "@/lib/api/respond";
import { SEARCH_PAGE } from "@/lib/constants";
import { conf } from "@/lib/config";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type") ?? "mini";
  const key = conf().SOUNDCLOUD.CLIENT_ID;

  if (!q) return badRequest('Query parameter "q" is required.');
  if (!key) return error("SoundCloud Client ID is not configured.", 500);

  if (type === "full") {
    const fullUrl = `https://api-v2.soundcloud.com/search?q=${encodeURIComponent(
      q
    )}&client_id=${key}&limit=20&offset=0`;
    const fullResponse = await fetch(fullUrl, { cache: "no-store" });
    if (!fullResponse.ok) return error("Failed SoundCloud full search.", 502);
    const full = await fullResponse.json();
    return json({ full });
  }

  const smallRes = await fetch(
    `https://api-v2.soundcloud.com/search/queries?q=${encodeURIComponent(
      q
    )}&client_id=${key}&limit=${SEARCH_PAGE.SMALL.LIMIT}&offset=${
      SEARCH_PAGE.SMALL.OFFSET
    }&linked_partitioning=1&app_version=1737027715&app_locale=en`,
    { cache: "no-store" }
  );
  if (!smallRes.ok) return error("Failed mini (small) search.", 502);

  const largeRes = await fetch(
    `https://api-v2.soundcloud.com/search?q=${encodeURIComponent(
      q
    )}&variant_ids=&query_urn=soundcloud%3Asearch-autocomplete%3Adeb7f341d9164082a21433260720aa9e&facet=model&user_id=681620-889553-566128-420969&client_id=${key}&limit=${
      SEARCH_PAGE.LARGE.LIMIT
    }&offset=${
      SEARCH_PAGE.LARGE.OFFSET
    }&linked_partitioning=1&app_version=1737027715&app_locale=en`,
    { cache: "no-store" }
  );
  if (!largeRes.ok) return error("Failed mini (large) search.", 502);

  const small = await smallRes.json();
  const large = await largeRes.json();
  return json({ small, large });
});
