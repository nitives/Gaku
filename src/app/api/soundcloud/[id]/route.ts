// src/app/api/soundcloud/[id]/route.ts
import type { NextRequest } from "next/server";
import { json, error, withErrorHandling } from "@/lib/api/respond";

// Keep dynamic while debugging; we'll cache the upstream fetches.
export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    // Use nextUrl for robust query parsing in Next 15
    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type") ?? "songs";
    const include = searchParams.get("include") ?? "";

    const apiKey = process.env.SOUNDCLOUD_API_KEY;
    if (!apiKey) return error("Missing SOUNDCLOUD_API_KEY", 500);

    const headers: Record<string, string> = {
      Host: "api-v2.soundcloud.com",
      Authorization: `OAuth ${apiKey}`,
    };

    // TTLs for caching the upstream responses (not your route response)
    const ttl = {
      track: 600, // 10m
      playlist: 1800, // 30m
      artist: 300, // 5m
      latest: 60, // 1m
      spotlight: 600, // 10m
      allTracks: 1800, // 30m
    };

    if (type === "albums") {
      const playlistRes = await fetch(
        `https://api-v2.soundcloud.com/playlists/${id}`,
        {
          headers,
          next: { revalidate: ttl.playlist, tags: [`sc:playlist:${id}`] },
        }
      );
      if (!playlistRes.ok) return error("Failed to fetch playlist", 502);
      const playlist = await playlistRes.json();

      const rest = (playlist.tracks ?? []).slice(5);
      const ids = rest.map((t: any) => t.id);
      if (ids.length > 0) {
        const tracksRes = await fetch(
          `https://api-v2.soundcloud.com/tracks?ids=${ids.join(",")}`,
          {
            headers,
            next: { revalidate: ttl.playlist, tags: [`sc:playlist:${id}`] },
          }
        );
        if (tracksRes.ok) {
          const tracks = await tracksRes.json();
          const map = new Map(tracks.map((t: any) => [t.id, t]));
          const reordered = ids.map((tid: any) => map.get(tid));
          playlist.tracks.splice(5, playlist.tracks.length - 5, ...reordered);
        }
      }
      return json(playlist);
    }

    if (type === "artist") {
      const artistRes = await fetch(
        `https://api-v2.soundcloud.com/users/${id}`,
        { headers, next: { revalidate: ttl.artist, tags: [`sc:artist:${id}`] } }
      );
      if (!artistRes.ok) return error("Failed to fetch artist", 502);
      const artist = await artistRes.json();

      const includes = include.split(",").filter(Boolean);

      if (includes.includes("spotlight")) {
        const spotlightRes = await fetch(
          `https://api-v2.soundcloud.com/users/${id}/spotlight`,
          {
            headers,
            next: {
              revalidate: ttl.spotlight,
              tags: [`sc:artist:${id}:spotlight`],
            },
          }
        );
        if (spotlightRes.ok) {
          const data = await spotlightRes.json();
          const tracks = data.collection || [];
          artist.spotlight = tracks.map((track: any) => ({
            ...track,
            artwork_url_hd: track.artwork_url
              ? track.artwork_url.replace("large", "t500x500")
              : null,
          }));
        }
      }

      if (includes.includes("latest")) {
        const latestRes = await fetch(
          `https://api-v2.soundcloud.com/stream/users/${id}`,
          {
            headers,
            next: { revalidate: ttl.latest, tags: [`sc:artist:${id}:latest`] },
          }
        );
        if (latestRes.ok) {
          const data = await latestRes.json();
          const tracks = data.collection || [];
          artist.latest = tracks.map((track: any) => {
            const trackData = track.track || track;
            return {
              ...track,
              track: {
                ...trackData,
                artwork_url_hd: trackData.artwork_url
                  ? trackData.artwork_url.replace("large", "t500x500")
                  : null,
              },
            };
          });
        }
      }

      if (includes.includes("allTracks")) {
        const allRes = await fetch(
          `https://api-v2.soundcloud.com/users/${id}/tracks?limit=500`,
          {
            headers,
            next: {
              revalidate: ttl.allTracks,
              tags: [`sc:artist:${id}:allTracks`],
            },
          }
        );
        if (allRes.ok) {
          const data = await allRes.json();
          const tracks = data.collection || [];
          artist.allTracks = tracks.map((track: any) => ({
            ...track,
            artwork_url_hd: track.artwork_url
              ? track.artwork_url.replace("large", "t500x500")
              : null,
          }));
        }
      }

      return json(artist);
    }

    // default: track or playlist by id
    const path = type === "playlists" ? `/playlists/${id}` : `/tracks/${id}`;
    const res = await fetch(`https://api-v2.soundcloud.com${path}`, {
      headers,
      next: {
        revalidate: type === "playlists" ? ttl.playlist : ttl.track,
        tags: [`sc:${type}:${id}`],
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("SoundCloud error:", res.status, text);
      return error("Failed to fetch resource", 502);
    }
    return json(await res.json());
  }
);
