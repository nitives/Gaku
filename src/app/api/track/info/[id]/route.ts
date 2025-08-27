import { json, error, withErrorHandling } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const headers = {
      Host: "api-v2.soundcloud.com",
      Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
    } as Record<string, string>;
    const res = await fetch(
      `https://api-v2.soundcloud.com/tracks/${id}?client_id=${process.env.SOUNDCLOUD_CLIENT_ID}`,
      { headers, cache: "no-store" }
    );
    if (!res.ok) return error("Failed to fetch track data", 502);
    return json(await res.json());
  }
);
