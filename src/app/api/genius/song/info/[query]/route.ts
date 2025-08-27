import { json, error, withErrorHandling, badRequest } from "@/lib/api/respond";

const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ query: string }> }) => {
    if (!GENIUS_ACCESS_TOKEN) return error("Missing GENIUS_ACCESS_TOKEN", 500);
    const { query } = await params;
    if (!query) return badRequest("Query parameter is required");
    const res = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(
        query
      )}&access_token=${GENIUS_ACCESS_TOKEN}`,
      { cache: "no-store" }
    );
    if (!res.ok) return error("Failed Genius search", 502);
    return json(await res.json());
  }
);
