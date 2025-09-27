(async () => {
  const { token: developerToken } = await fetch("/api/apple/dev-token").then(
    (r) => r.json()
  );

  await MusicKit.configure({
    developerToken,
    app: { name: "Gaku Music", build: "1.0.0" },
  });

  const music = MusicKit.getInstance();

  // 2) Trigger Apple Music sign-in → returns the media-user-token
  const userToken = await music.authorize(); // <-- Media-User-Token
  console.log("Media-User-Token:", userToken);

  // (optional) persist + send to your server
  localStorage.setItem("apple_user_token", userToken);
  await fetch("/api/apple/store-user-token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userToken }),
  });
})();
