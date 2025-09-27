import { conf } from "@/lib/config";
import { json, error, withErrorHandling } from "@/lib/api/respond";
import { AppleKit } from "@/lib/apple/kit";

const USER_TOKEN = conf().APPLE.MUSIC.USER_TOKEN;
const USE_PERSONAL_TOKEN = conf().APPLE.MUSIC.USE_PERSONAL_TOKEN;
const APPLE_AUTH = conf().APPLE.MUSIC.AUTH;

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ query: string }> }) => {
    const devToken = USE_PERSONAL_TOKEN
      ? APPLE_AUTH
      : await AppleKit.createAppleDevToken();
    if (!devToken) return error("Missing APPLE_AUTH", 500);

    const { query } = await params;
    const url = new URL(_req.url);
    const isrc = url.searchParams.get("isrc")?.trim();

    // Try resolve by ISRC first (if provided), then fall back to term search
    let songID: string | undefined;
    let artwork: any | null = null;

    if (isrc) {
      const byIsrcRes = await fetch(
        `https://api.music.apple.com/v1/catalog/us/songs?filter[isrc]=${encodeURIComponent(
          isrc
        )}`,
        {
          headers: {
            Authorization: `Bearer ${devToken}`,
            Origin: "https://music.apple.com",
          },
          cache: "no-store",
        }
      );
      if (byIsrcRes.status === 401 || byIsrcRes.status === 403)
        return error("Reauthentication required", 502);
      if (byIsrcRes.ok) {
        const byIsrcData = await byIsrcRes.json();
        const first = byIsrcData?.data?.[0];
        if (first?.id) {
          songID = first.id;
          artwork = first.attributes?.artwork ?? null;
        }
      }
    }

    if (!songID) {
      const searchRes = await fetch(
        `https://api.music.apple.com/v1/catalog/us/search?types=songs&term=${encodeURIComponent(
          query
        )}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${devToken}`,
            Origin: "https://music.apple.com",
          },
          cache: "no-store",
        }
      );
      if (searchRes.status === 401 || searchRes.status === 403)
        return error("Reauthentication required", 502);
      if (!searchRes.ok) return error("Failed Apple search", 502);
      const searchData = await searchRes.json();
      songID = searchData.results?.songs?.data?.[0]?.id;
      if (!artwork) {
        artwork =
          searchData.results?.songs?.data?.[0]?.attributes?.artwork ?? null;
      }
    }

    if (!songID) return error("Song not found", 404);

    const lyricsRes = await fetch(
      `https://amp-api.music.apple.com/v1/catalog/us/songs/${songID}/syllable-lyrics`,
      {
        headers: {
          Authorization: `Bearer ${devToken}`,
          "media-user-token": USER_TOKEN,
          Origin: "https://music.apple.com",
        },
        cache: "no-store",
      }
    );
    if (!lyricsRes.ok) return error("Failed Apple lyrics", 502);
    const lyrics = await lyricsRes.json();
    return json({ lyrics, artwork });
  }
);
