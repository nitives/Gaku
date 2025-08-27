export interface Song {
  albumName: string;
  // artistId: number;
  // artistName: string;
  // artistUrl: string;
  artist: {
    id: number;
    name: string;
    url: string;
    soundcloudURL: string;
    permalink: string;
    verified: boolean;
    followers: number;
    city: string;
    avatar: string;
  };
  metadata?: {
    albumTitle?: string;
    artistName?: string;
    isrc?: string;
  };
  artwork: Artwork;
  contentRating?: string;
  discNumber?: number;
  id: number;
  songHref: string;
  name: string;
  color?: string[];
  explicit?: boolean;
  releaseDate?: string;
  src: string;
}

export interface Album {
  artistName: string;
  artwork: Artwork;
  releaseDate?: string;
  genre?: string;
  name: string;
  kind: "album";
  trackCount: number;
  id: number | string;
  relationships?: {
    tracks: Tracks[];
  };
}

export interface Artwork {
  animatedURL?: string;
  hdUrl: string | undefined;
  url: string | undefined;
  width?: number;
  height?: number;
}

export interface Tracks {
  data: Song[];
  href: string;
  total: number;
}
