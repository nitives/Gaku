import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const APPLE_AUTH = process.env.APPLE_AUTH;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req.query;

  if (req.method === "GET") {
    try {
      console.log(`AppleKit API | Query: ${query}`);
      const searchResponse = await axios.get(
        `https://api.music.apple.com/v1/catalog/us/search?limit=5&term=${query}&types=artists`,
        {
          headers: {
            Origin: "https://music.apple.com",
            Authorization: `Bearer ${APPLE_AUTH}`,
          },
        }
      );

      const artistID = searchResponse.data.results.artists.data[0].id;
      const response = await axios.get(
        `https://amp-api.music.apple.com/v1/catalog/us/artists/${artistID}?art%5Burl%5D=c%2Cf&extend=artistBio%2CbornOrFormed%2CeditorialArtwork%2CeditorialVideo%2CextendedAssetUrls%2Chero%2CisGroup%2Corigin%2CplainEditorialNotes%2CseoDescription%2CseoTitle&extend%5Bplaylists%5D=trackCount&format%5Bresources%5D=map&include=record-labels%2Cartists&include%5Bmusic-videos%5D=artists&include%5Bsongs%5D=artists%2Calbums&l=en-US&limit%5Bartists%3Atop-songs%5D=20&meta%5Balbums%3Atracks%5D=popularity&platform=web&views=appears-on-albums%2Ccompilation-albums%2Cfeatured-albums%2Cfeatured-on-albums%2Cfeatured-release%2Cfull-albums%2Clatest-release%2Clive-albums%2Cmore-to-hear%2Cmore-to-see%2Cmusic-videos%2Cplaylists%2Cradio-shows%2Csimilar-artists%2Csingles%2Ctop-songs`,
        {
          headers: {
            Origin: "https://music.apple.com",
            Authorization: `Bearer ${APPLE_AUTH}`,
          },
        }
      );
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while fetching the song info | MusicKit",
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
