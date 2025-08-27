import { json, badRequest, error, withErrorHandling } from "@/lib/api/respond";

function generateRandomId() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .slice(2, 10);
}

async function getMXMToken() {
  const t = generateRandomId();
  const tokenUrl = `https://apic-desktop.musixmatch.com/ws/1.1/token.get?app_id=web-desktop-app-v1.0&t=${t}`;
  const res = await fetch(tokenUrl, {
    headers: {
      Cookie:
        "11601B1EF8BC274C33F9043CA947F99DCFF8378C231564BC3E68894E08BD389E37D51060B3D21B0B0C9BD2CD4B7FB43BF686CF57330A3F26A0D86825F74794F3C94; mxm-encrypted-token=; x-mxm-token-guid=undefined; x-mxm-user-id=undefined",
      "User-Agent": "PostmanRuntime/7.41.2",
      Accept: "*/*",
      Connection: "keep-alive",
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Encoding": "gzip, deflate, br",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to retrieve user token");
  const data = await res.json();
  if (data.message?.header?.status_code === 200)
    return data.message.body.user_token as string;
  throw new Error("Failed to retrieve user token");
}

async function getRichSync(track: string, artist: string, token: string) {
  const url = `https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get?format=json&namespace=lyrics_richsynched&optional_calls=track.richsync&q_artist=${encodeURIComponent(
    artist
  )}&q_track=${encodeURIComponent(
    track
  )}&usertoken=240907c8a5257abdda0a975ac3ec819a5bb759721255daec124ddc&app_id=web-desktop-app-v1.0&t=${token}`;
  const res = await fetch(url, {
    headers: {
      Cookie:
        "11601B1EF8BC274C33F9043CA947F99DCFF8378C231564BC3E68894E08BD389E37D51060B3D21B0B0C9BD2CD4B7FB43BF686CF57330A3F26A0D86825F74794F3C94; mxm-encrypted-token=; x-mxm-token-guid=undefined; x-mxm-user-id=undefined",
      "User-Agent": "PostmanRuntime/7.41.2",
      Accept: "*/*",
      Connection: "keep-alive",
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Encoding": "gzip, deflate, br",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to retrieve rich sync subtitles");
  const data = await res.json();
  if (
    data?.message?.header?.status_code === 200 &&
    data?.message?.body?.macro_calls?.["track.richsync.get"]
  ) {
    return data.message.body.macro_calls["track.richsync.get"];
  }
  throw new Error("Failed to retrieve rich sync subtitles");
}

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get("artist");
  const track = searchParams.get("track");
  if (!artist || !track)
    return badRequest("Missing artist or track query parameter");

  const userToken = await getMXMToken();
  const lyrics = await getRichSync(track, artist, userToken);
  return json({ lyrics });
});
