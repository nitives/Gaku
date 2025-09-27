import { conf } from "@/lib/config";
import { json, error, withErrorHandling } from "@/lib/api/respond";
import { AppleKit } from "@/lib/apple/kit";

export const dynamic = "force-dynamic";

const USE_PERSONAL_TOKEN = conf().APPLE.MUSIC.USE_PERSONAL_TOKEN;
const APPLE_AUTH = conf().APPLE.MUSIC.AUTH;

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ query: string }> }) => {
    const devToken = USE_PERSONAL_TOKEN
      ? APPLE_AUTH
      : await AppleKit.createAppleDevToken();
    if (!devToken) return error("Missing APPLE_AUTH", 500);
    const { query } = await params;
    const searchRes = await fetch(
      `https://api.music.apple.com/v1/catalog/us/search?limit=5&term=${encodeURIComponent(
        query
      )}&types=artists`,
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
    if (!searchRes.ok) return error("Failed Apple artist search", 502);
    const search = await searchRes.json();
    const artistID = search.results?.artists?.data?.[0]?.id;
    if (!artistID) return error("Artist not found", 404);

    const res = await fetch(
      `https://amp-api.music.apple.com/v1/catalog/us/artists/${artistID}?art%5Burl%5D=c%2Cf&extend=artistBio%2CbornOrFormed%2CeditorialArtwork%2CeditorialVideo%2CextendedAssetUrls%2Chero%2CisGroup%2Corigin%2CplainEditorialNotes%2CseoDescription%2CseoTitle&extend%5Bplaylists%5D=trackCount&format%5Bresources%5D=map&include=record-labels%2Cartists&include%5Bmusic-videos%5D=artists&include%5Bsongs%5D=artists%2Calbums&l=en-US&limit%5Bartists%3Atop-songs%5D=20&meta%5Balbums%3Atracks%5D=popularity&platform=web&views=appears-on-albums%2Ccompilation-albums%2Cfeatured-albums%2Cfeatured-on-albums%2Cfeatured-release%2Cfull-albums%2Clatest-release%2Clive-albums%2Cmore-to-hear%2Cmore-to-see%2Cmusic-videos%2Cplaylists%2Cradio-shows%2Csimilar-artists%2Csingles%2Ctop-songs`,
      {
        headers: {
          Authorization: `Bearer ${devToken}`,
          Origin: "https://music.apple.com",
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return error("Failed Apple artist details", 502);
    return json(await res.json());
  }
);
