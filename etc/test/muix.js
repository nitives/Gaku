const axios = require("axios");
const { wrapper } = require("axios-cookiejar-support");
const tough = require("tough-cookie");

// Enable cookie jar support in axios
wrapper(axios);

// Create a cookie jar instance to store cookies
const cookieJar = new tough.CookieJar();

function revisedRandId() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .slice(2, 10);
}

// Function to get the Musixmatch token
async function getMXMToken() {
  const url = `https://apic-desktop.musixmatch.com/ws/1.1/token.get?app_id=web-desktop-app-v1.0&t=${revisedRandId()}`;

  try {
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        Connection: "keep-alive",
        Origin: "https://www.musixmatch.com",
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      jar: cookieJar, // Use the cookie jar to handle cookies
      withCredentials: true, // Ensure credentials like cookies are sent
      maxRedirects: 5, // Limit redirects to prevent redirect loops
    });

    if (response.status === 200) {
      const token = response.data.message.body.user_token;
      console.log("Token:", token);
      return token; // Return the token to use in other functions
    } else {
      console.error("Failed to retrieve token, status:", response.status);
    }
  } catch (error) {
    console.error("Error fetching token:", error);
  }
}

// Function to get lyrics using the Musixmatch API
async function getLyrics(
  track,
  artist,
  token,
  richsyncQuery,
  itunesid,
  timecustom
) {
  const url = `https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get?format=json&namespace=lyrics_richsynched${richsyncQuery}&subtitle_format=lrc&q_artist=${encodeURIComponent(
    artist
  )}&q_track=${encodeURIComponent(
    track
  )}${itunesid}&usertoken=${token}${timecustom}&app_id=web-desktop-app-v1.0&t=${revisedRandId()}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        Connection: "keep-alive",
      },
    });

    if (
      response.status === 200 &&
      response.data.message.header.status_code === 200
    ) {
      console.log(
        "Subtitles (Rich Sync):",
        response.data.message.body.subtitle.subtitle_body
      );
    } else {
      console.error("Failed to retrieve subtitles");
    }
  } catch (error) {
    console.error("Error fetching subtitles:", error);
  }
}

// Function to get rich sync subtitles
async function getRichSync(track, artist, token) {
  const url = `https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get?format=json&namespace=lyrics_richsynched&subtitle_format=lrc&q_artist=${encodeURIComponent(
    artist
  )}&q_track=${encodeURIComponent(
    track
  )}&usertoken=${token}&app_id=web-desktop-app-v1.0&t=${revisedRandId()}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "text/plain; charset=utf-8",
        Connection: "keep-alive",
        Origin: "https://www.musixmatch.com",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      jar: cookieJar, // Use the cookie jar to handle cookies
      withCredentials: true, // Ensure credentials like cookies are sent
      maxRedirects: 5, // Limit redirects to prevent redirect loops
    });

    if (
      response.status === 200 &&
      response.data.message.header.status_code === 200
    ) {
      console.log("Rich Sync Subtitles:", response.data.body);
    } else {
      console.error("Failed to retrieve rich sync subtitles");
    }
  } catch (error) {
    console.error("Error fetching rich sync:", error);
  }
}

// Example usage of the functions
(async () => {
  const token = await getMXMToken(); // Get the Musixmatch token

  if (token) {
    const track = "Shape of You";
    const artist = "Ed Sheeran";

    await getRichSync(track, artist, token);
  }
})();
