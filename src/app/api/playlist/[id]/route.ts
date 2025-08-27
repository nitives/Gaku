import { json, error, withErrorHandling } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const headers = {
      Host: "api-v2.soundcloud.com",
      Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
    } as Record<string, string>;

    const playlistRes = await fetch(
      `https://api-v2.soundcloud.com/playlists/${id}`,
      { headers, cache: "no-store" }
    );
    if (!playlistRes.ok) return error("Failed to fetch playlist", 502);
    const playlist = await playlistRes.json();

    const trackIdsToFetch = (playlist.tracks ?? [])
      .slice(5)
      .map((t: any) => t.id);
    if (trackIdsToFetch.length > 0) {
      const tracksRes = await fetch(
        `https://api-v2.soundcloud.com/tracks?ids=${trackIdsToFetch.join(",")}`,
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
