import { conf } from "@/lib/config";
import { json, error, withErrorHandling } from "@/lib/api/respond";
import { AppleKit } from "@/lib/apple/kit";

export const dynamic = "force-dynamic";

const USE_PERSONAL_TOKEN = conf().APPLE.MUSIC.USE_PERSONAL_TOKEN;
const APPLE_AUTH = conf().APPLE.MUSIC.AUTH;

export const GET = withErrorHandling(
  async (
    request: Request,
    { params }: { params: Promise<{ query: string }> }
  ) => {
    const devToken = USE_PERSONAL_TOKEN
      ? APPLE_AUTH
      : await AppleKit.createAppleDevToken();
    if (!devToken) return error("Missing APPLE_AUTH", 500);
    const { query } = await params;
    if (!query) return error("Query parameter is required", 400);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") === "albums" ? "albums" : "songs";

    const searchRes = await fetch(
      `https://api.music.apple.com/v1/catalog/us/search?limit=5&term=${encodeURIComponent(
        query
      )}&types=${type}`,
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
    const search = await searchRes.json();
    const albumId = search.results?.albums?.data?.[0]?.id;
    if (!albumId) return error("Album not found", 404);

    const albumRes = await fetch(
      `https://amp-api.music.apple.com/v1/catalog/us/albums/${albumId}?l=en-US&extend=editorialArtwork%2CeditorialVideo%2CextendedAssetUrls%2Coffers%2CtrackCount%2Ctags`,
      {
        headers: {
          Authorization: `Bearer ${devToken}`,
          Origin: "https://music.apple.com",
        },
        cache: "no-store",
      }
    );
    if (!albumRes.ok) return error("Failed Apple album", 502);
    return json(await albumRes.json());
  }
);
