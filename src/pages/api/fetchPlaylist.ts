import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const playlistUrl =
    "https://cf-hls-media.sndcdn.com/playlist/ladE0RdPLsfF.128.mp3/playlist.m3u8?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiKjovL2NmLWhscy1tZWRpYS5zbmRjZG4uY29tL3BsYXlsaXN0L2xhZEUwUmRQTHNmRi4xMjgubXAzL3BsYXlsaXN0Lm0zdTgqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzIyMjYyMjM2fX19XX0_&Signature=W5n2X6xOOGQbabQzs9YwdlErYwVJKVs3laUYgYSQyCD8-Zw5X3qf1iPkwZrUpLZEFrs7LbzWWeuSuUUftFfJUvd3Wt~yewq~ZixtHVTFeC8T16U9MYOeniQkPWirFrPo3koRwmyv8gTsei2teX9yBUbZhlFadFsyoCwYQB0~tuLDYrIJYvTB~vSp8bgnUgjR~sua1HzyRtEx9dfBnoFMBb68ksrRfFJJycGAB6LueucnA2~MfgzGRCufr7avxe-FEyQIqzzlpMnBHjgOUWw7tldq91l3DWhVm2ouvlIhRqZZIPK1MTnvLVrGI-xwW5w90I9n3VUau8gUq0sjbxKQ6A__&Key-Pair-Id=APKAI6TU7MMXM5DG6EPQ";

  try {
    const response = await fetch(playlistUrl, {
      headers: {
        "Content-Type": "application/x-mpegURL",
      },
    });
    // console.log("fetchPlaylist | response:", response);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    // console.log("fetchPlaylist | data:", data);
    res.status(200).json({ playlist: data });
  } catch (error: unknown) {
    console.error(
      "Fetch error:",
      error instanceof Error ? error.message : String(error)
    );
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : String(error) });
  }
}
