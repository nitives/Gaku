import { json, error, withErrorHandling } from "@/lib/api/respond";
import { scAuth } from "@/lib/config";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { CLIENT_ID } = await scAuth();
    const headers = {
      Host: "api-v2.soundcloud.com",
    } as Record<string, string>;
    const clientIdQuery = `?client_id=${CLIENT_ID || process.env.SOUNDCLOUD_CLIENT_ID}`;
    const playlistRes = await fetch(
      `https://api-v2.soundcloud.com/playlists/${id}${clientIdQuery}`,
      { headers, cache: "no-store" }
    );
    if (!playlistRes.ok) return error("Failed to fetch playlist", 502);
    const playlist = await playlistRes.json();

    const trackIdsToFetch = (playlist.tracks ?? [])
      .slice(5)
      .map((t: any) => t.id);
    if (trackIdsToFetch.length > 0) {
      const tracksRes = await fetch(
        `https://api-v2.soundcloud.com/tracks?ids=${trackIdsToFetch.join(",")}${clientIdQuery}`,
        { headers, cache: "no-store" }
      );
      if (tracksRes.ok) {
        const tracks = await tracksRes.json();
        const map = new Map(tracks.map((t: any) => [t.id, t]));
        const reordered = trackIdsToFetch.map((id: any) => map.get(id));
        playlist.tracks.splice(5, playlist.tracks.length - 5, ...reordered);
      }
    }
    return json(playlist);
  }
);
