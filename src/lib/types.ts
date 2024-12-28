// Lyrics
export interface Verse {
  c: string; // content of the verse
  o: number; // offset time of the verse
}

export interface Lyric {
  ts: number; // start time
  te: number; // end time
  l: Verse[]; // list of verses
  x: string; // full lyric line
  translation?: string; // optional translation
}

