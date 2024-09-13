import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
const { wrapper } = require("axios-cookiejar-support");
const tough = require("tough-cookie");

// Enable cookie jar support in axios
wrapper(axios);

// Create a cookie jar instance to store cookies
const cookieJar = new tough.CookieJar();

// Function to generate a random ID
function generateRandomId() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .slice(2, 10);
}

// Function to get the Musixmatch token
async function getMXMToken() {
  const tokenUrl = `https://apic-desktop.musixmatch.com/ws/1.1/token.get?app_id=web-desktop-app-v1.0&t=${generateRandomId()}`;

  try {
    const response = await axios.get(tokenUrl, {
      headers: {
        Cookie:
          "11601B1EF8BC274C33F9043CA947F99DCFF8378C231564BC3E68894E08BD389E37D51060B3D21B0B0C9BD2CD4B7FB43BF686CF57330A3F26A0D86825F74794F3C94; mxm-encrypted-token=; x-mxm-token-guid=undefined; x-mxm-user-id=undefined",
        "User-Agent": "PostmanRuntime/7.41.2",
        Accept: "*/*",
        Connection: "keep-alive",
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Encoding": "gzip, deflate, br",
      },
      // httpsAgent: new (axios.create().defaults.httpsAgent.constructor)({
      //   jar: cookieJar,
      // }),
      // withCredentials: true,
      // maxRedirects: 5,
    });
    console.log("getMXMToken | response:", response.data);

    if (
      response.data.message &&
      response.data.message.header.status_code === 200
    ) {
      return response.data.message.body.user_token;
    } else {
      throw new Error("Failed to retrieve user token");
    }
  } catch (error: any) {
    console.error("Error fetching token:", error.message);
    throw new Error(`Error fetching token: ${error.message}`);
  }
}

// Function to get rich sync subtitles
async function getRichSync(track: string, artist: string, token: string) {
  const url = `https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get?format=json&namespace=lyrics_richsynched&optional_calls=track.richsync&q_artist=${encodeURIComponent(
    artist
  )}&q_track=${encodeURIComponent(
    track
  )}&usertoken=240907c8a5257abdda0a975ac3ec819a5bb759721255daec124ddc&app_id=web-desktop-app-v1.0&t=${token}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Cookie:
          "11601B1EF8BC274C33F9043CA947F99DCFF8378C231564BC3E68894E08BD389E37D51060B3D21B0B0C9BD2CD4B7FB43BF686CF57330A3F26A0D86825F74794F3C94; mxm-encrypted-token=; x-mxm-token-guid=undefined; x-mxm-user-id=undefined",
        "User-Agent": "PostmanRuntime/7.41.2",
        Accept: "*/*",
        Connection: "keep-alive",
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Encoding": "gzip, deflate, br",
      },
    });

    // console.log("getRichSync | response:", response.data);
    console.log(
      "getRichSync | response.data.message.body:",
      response.data.message.body
    );
    // console.log(
    //   "getRichSync | response.data.message.body.macro_calls:",
    //   response.data.message.body.macro_calls["track.richsync.get"].message.body
    // );

    if (
      response.status === 200 &&
      response.data.message.header.status_code === 200 &&
      response.data.message.body.macro_calls["track.richsync.get"]
    ) {
      return response.data.message.body.macro_calls["track.richsync.get"];
    } else {
      throw new Error("Failed to retrieve rich sync subtitles");
    }
  } catch (error: any) {
    console.error("Error fetching rich sync:", error.message);
    throw new Error(`Error fetching rich sync: ${error.message}`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { artist, track } = req.query;

    // const artist = "TheWeeknd";
    // const track = "Starboy";

    if (!artist || !track) {
      return res
        .status(400)
        .json({ error: "Missing artist or track query parameter" });
    }

    try {
      // Step 1: Get Musixmatch token
      const userToken = await getMXMToken();

      // Step 2: Fetch rich sync lyrics
      const lyrics = await getRichSync(
        artist as string,
        track as string,
        userToken
      );

      // Step 3: Send response with rich sync lyrics
      res.status(200).json({ lyrics });
    } catch (error: any) {
      console.error("Error fetching lyrics:", error.message);
      res.status(500).json({ error: "An error occurred" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
