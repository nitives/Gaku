import { json, error, withErrorHandling } from "@/lib/api/respond";
import { conf } from "@/lib/config";

const APPLE_AUTH = conf().APPLE.MUSIC.AUTH;

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (request: Request, { params }: { params: Promise<{ query: string }> }) => {
    if (!APPLE_AUTH) return error("Missing APPLE_AUTH", 500);
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
          Origin: "https://music.apple.com",
          Authorization: `Bearer ${APPLE_AUTH}`,
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
          Origin: "https://music.apple.com",
          Authorization: `Bearer ${APPLE_AUTH}`,
        },
        cache: "no-store",
      }
    );
    if (!albumRes.ok) return error("Failed Apple album", 502);
    return json(await albumRes.json());
  }
);
