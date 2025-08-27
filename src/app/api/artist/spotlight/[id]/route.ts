import { json, error, withErrorHandling } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const headers = {
      Host: "api-v2.soundcloud.com",
      Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
    } as Record<string, string>;
    const { id } = await params;
    const res = await fetch(
      `https://api-v2.soundcloud.com/users/${id}/spotlight`,
      { headers, cache: "no-store" }
    );
    if (!res.ok) return error("Failed to fetch artist spotlight", 502);
    const data = await res.json();
    const tracks = (data.collection ?? []).map((track: any) => ({
      ...track,
      artwork_url_hd: track.artwork_url
        ? track.artwork_url.replace("large", "t500x500")
        : null,
    }));
    return json({ ...data, collection: tracks });
  }
);
