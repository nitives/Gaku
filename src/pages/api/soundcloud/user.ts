import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { JSDOM } from "jsdom";

const clientID = process.env.SOUNDCLOUD_CLIENT_ID;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { profileUrl, type } = req.query;

  console.log("profileUrl:", profileUrl);

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Ensure profileUrl is a string and not undefined or an array
  const profileUrlString = Array.isArray(profileUrl)
    ? profileUrl[0]
    : profileUrl;

  if (!profileUrlString) {
    return res
      .status(400)
      .json({ error: "Profile URL (or user ID) is required" });
  }

  let userId: string | null = null;

  try {
    if (type === "id") {
      // When type is 'id', profileUrlString is actually the SoundCloud user ID
      userId = profileUrlString;
    } else {
      // Step 1: Fetch the HTML from the SoundCloud profile page
      const response = await axios.get(profileUrlString);

      // Step 2: Parse the HTML using JSDOM
      const dom = new JSDOM(response.data);
      const document = dom.window.document;

      // Step 3: Find the meta tag with property `twitter:app:url:googleplay`
      const metaTag = document.querySelector(
        'meta[property="twitter:app:url:googleplay"]'
      );

      if (!metaTag) {
        return res.status(404).json({ error: "User ID not found in meta tag" });
      }

      // Step 4: Extract the content attribute which contains the user ID
      const content = metaTag.getAttribute("content");
      const userIdMatch = content ? content.match(/users:(\d+)/) : null;
      userId = userIdMatch ? userIdMatch[1] : null;

      if (!userId) {
        return res
          .status(404)
          .json({ error: "User ID not found in the content" });
      }
    }

    // Step 5: Fetch user data from SoundCloud API
    const userDataResponse = await axios.get(
      `https://api-v2.soundcloud.com/users/${userId}`,
      {
        headers: {
          Host: "api-v2.soundcloud.com",
          Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
        },
      }
    );
    const userLikesResponse = await axios.get(
      `https://api-v2.soundcloud.com/users/${userId}/likes?client_id=${clientID}&limit=500&offset=0`,
      {
        headers: {
          Host: "api-v2.soundcloud.com",
          Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
        },
      }
    );

    // Step 6: Combine the data
    const data = {
      userData: userDataResponse.data,
      userLikes: userLikesResponse.data,
    };

    // Step 7: Return the combined data
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ error: "Failed to fetch user data" });
  }
}
