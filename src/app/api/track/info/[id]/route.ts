import { json, error, withErrorHandling } from "@/lib/api/respond";
import { scAuth } from "@/lib/config";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { CLIENT_ID, GUEST_KEY } = await scAuth();
    const headers = {
      Host: "api-v2.soundcloud.com",
      // Authorization: `OAuth ${GUEST_KEY || process.env.SOUNDCLOUD_API_KEY}`,
    } as Record<string, string>;
    const clientIdQuery = `?client_id=${CLIENT_ID || process.env.SOUNDCLOUD_CLIENT_ID}`;
    const res = await fetch(
      `https://api-v2.soundcloud.com/tracks/${id}${clientIdQuery}`,
      { headers, cache: "no-store" }
    );
    if (!res.ok) return error("Failed to fetch track data", 502);
    return json(await res.json());
  }
);
