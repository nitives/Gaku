import { json, error, withErrorHandling } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const playlistUrl =
    "https://cf-hls-media.sndcdn.com/playlist/ladE0RdPLsfF.128.mp3/playlist.m3u8?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiKjovL2NmLWhscy1tZWRpYS5zbmRjZG4uY29tL3BsYXlsaXN0L2xhZEUwUmRQTHNmRi4xMjgubXAzL3BsYXlsaXN0Lm0zdTgqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzIyMjYyMjM2fX19XX0_&Signature=W5n2X6xOOGQbabQzs9YwdlErYwVJKVs3laUYgYSQyCD8-Zw5X3qf1iPkwZrUpLZEFrs7LbzWWeuSuUUftFfJUvd3Wt~yewq~ZixtHVTFeC8T16U9MYOeniQkPWirFrPo3koRwmyv8gTsei2teX9yBUbZhlFadFsyoCwYQB0~tuLDYrIJYvTB~vSp8bgnUgjR~sua1HzyRtEx9dfBnoFMBb68ksrRfFJJycGAB6LueucnA2~MfgzGRCufr7avxe-FEyQIqzzlpMnBHjgOUWw7tldq91l3DWhVm2ouvlIhRqZZIPK1MTnvLVrGI-xwW5w90I9n3VUau8gUq0sjbxKQ6A__&Key-Pair-Id=APKAI6TU7MMXM5DG6EPQ";

  const response = await fetch(playlistUrl, {
    headers: { "Content-Type": "application/x-mpegURL" },
    cache: "no-store",
  });
  if (!response.ok) {
    return error(`Upstream error: ${response.status}`, 502);
  }
  const data = await response.text();
  return json({ playlist: data }, 200);
});
