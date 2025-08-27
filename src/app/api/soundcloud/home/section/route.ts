import { json, error, withErrorHandling } from "@/lib/api/respond";
import { conf } from "@/lib/config";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const KEY = conf().SOUNDCLOUD.CLIENT_ID;
  const APIKEY = conf().SOUNDCLOUD.API_KEY;
  const res = await fetch(
    `https://api-v2.soundcloud.com/mixed-selections?client_id=${KEY}`,
    { headers: { Authorization: `OAuth ${APIKEY}` }, cache: "no-store" }
  );
  if (!res.ok) return error("Failed to fetch SoundCloud sections", 502);
  const data = await res.json();
  const includedFeatureNames = [
    "buzzing",
    "trending-by-genre",
    "curated-charts-top-50",
    "curated-trending-music-on-soundcloud",
    "curated-fresh-pressed",
    "curated-scenes-corners-of-soundcloud",
    "curated-hip-hop",
    "curated-pop",
    "curated-electronic",
    "curated-chill",
    "curated-introducing-buzzing",
    "curated-get-up",
    "curated-rb",
    "curated-holiday",
    "curated-country",
  ];
  const filtered = data.collection.filter((item: any) =>
    includedFeatureNames.includes(item.tracking_feature_name)
  );
  const enhanced = filtered.map((item: any) => ({
    ...item,
    items: {
      ...item.items,
      collection: item.items.collection.map((nestedItem: any) => ({
        avatar_url_hd: nestedItem.avatar_url
          ? nestedItem.avatar_url.replace("large", "t500x500")
          : null,
        avatar_url: nestedItem.avatar_url ?? null,
        artwork_url_hd: nestedItem.artwork_url
          ? nestedItem.artwork_url.replace("large", "t500x500")
          : null,
        artwork_url: nestedItem.artwork_url ?? null,
        ...nestedItem,
      })),
    },
  }));
  return json({ ...data, collection: enhanced });
});
