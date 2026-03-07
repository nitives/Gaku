import { json, error, withErrorHandling } from "@/lib/api/respond";
import { conf, scAuth } from "@/lib/config";
import { dev } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const { CLIENT_ID } = await scAuth();
  const KEY =  CLIENT_ID || conf().SOUNDCLOUD.CLIENT_ID;
  const res = await fetch(
    `https://api-v2.soundcloud.com/mixed-selections?client_id=${KEY}`,
  );
  if (!KEY) return error("SoundCloud API key is not configured", 500);
  if (res.status === 403) return error("Forbidden: Invalid SoundCloud API key", 403);
  if (res.status === 401) return error("Unauthorized: Invalid SoundCloud API key", 401);
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
