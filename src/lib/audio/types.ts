export interface Song {
  albumName: string;
  artistName: string;
  artwork: Artwork;
  contentRating?: string;
  discNumber?: number;
  id: number;
  songHref: string;
  name: string;
  color?: string[];
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