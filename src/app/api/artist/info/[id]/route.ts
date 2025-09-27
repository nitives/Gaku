import { json, error, withErrorHandling } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const headers = {
      Host: "api-v2.soundcloud.com",
      Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
    } as Record<string, string>;
    const res = await fetch(`https://api-v2.soundcloud.com/users/${id}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return error("Failed to fetch artist data", 502);
    return json(await res.json());
  }
);
