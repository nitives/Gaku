import { json, error, withErrorHandling } from "@/lib/api/respond";
import { scAuth } from "@/lib/config";

const clientID = process.env.SOUNDCLOUD_CLIENT_ID;

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { CLIENT_ID } = await scAuth();
    const headers = {
      Host: "api-v2.soundcloud.com",
    } as Record<string, string>;
    const clientIdQuery = `?client_id=${CLIENT_ID || process.env.SOUNDCLOUD_CLIENT_ID}`;
    const res = await fetch(
      `https://api-v2.soundcloud.com/users/${id}/tracks?representation=${clientIdQuery}`,
      { headers, cache: "no-store" }
    );
    if (!res.ok) return error("Failed to fetch artist tracks", 502);
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
