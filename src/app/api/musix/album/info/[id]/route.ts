import { json, error, withErrorHandling } from "@/lib/api/respond";

const MUSIX_API_KEY = process.env.MUSIX_API_KEY;

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    if (!MUSIX_API_KEY) return error("Missing MUSIX_API_KEY", 500);
    const res = await fetch(
      `http://api.musixmatch.com/ws/1.1/album.get?album_id=${id}&format=json&apikey=${MUSIX_API_KEY}`,
      { cache: "no-store" }
    );
    if (!res.ok) return error("Failed to fetch album data", 502);
    return json(await res.json());
  }
);
