import { json, badRequest, error, withErrorHandling } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ url: string }> }) => {
    const { url } = await params;
    if (!url) return badRequest("URL parameter is required");
    const decodedUrl = decodeURIComponent(url);
    if (!decodedUrl) return badRequest("URL parameter is required");
    const res = await fetch(decodedUrl, { cache: "no-store" });
    if (!res.ok) return error("Failed to fetch page", 502);
    const html = await res.text();
    const metaMatch = html.match(
      /<meta property=["']al:ios:url["'] content=["']([^"']+)["']/
    );
    if (metaMatch?.[1]) {
      const content = metaMatch[1];
      const trackId = content.replace(/soundcloud:\/\/(sounds|playlists):/, "");
      return json({ trackId });
    }
    return error("Track ID not found", 404);
  }
);
