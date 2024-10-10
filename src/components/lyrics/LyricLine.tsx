import React from "react";
import LyricWord from "./LyricWord";

interface RichSyncLyricLine {
  ts: number;
  te: number;
  l: { c: string; o: number }[];
  x?: string;
  translation?: string;
}

interface LineSyncLyricLine {
  startTimeMs: string;
  words: string;
  endTimeMs: string;
}

interface LyricLineProps {
  index: number;
  lyric: RichSyncLyricLine | LineSyncLyricLine;
  isActive: boolean;
  isUnsynced: boolean;
  seekTo: (time: number) => void;
  smoothTime: number;
  delayfix: number;
  getWordDuration?: (lineIndex: number, wordIndex: number) => number;
  syncType: "WORD_SYNCED" | "LINE_SYNCED";
}

const LyricLine: React.FC<LyricLineProps> = ({
  index,
  lyric,
  isActive,
  isUnsynced,
  seekTo,
  smoothTime,
  delayfix,
  getWordDuration,
  syncType,
}) => {
  const handleClick = () => {
    const time =
      syncType === "WORD_SYNCED"
        ? (lyric as RichSyncLyricLine).ts
        : parseInt((lyric as LineSyncLyricLine).startTimeMs) / 1000;
    seekTo(time);
  };

  if (syncType === "WORD_SYNCED") {
    // Rich Sync Lyrics
    const richLyric = lyric as RichSyncLyricLine;
    return (
      <h3
        className={`lyric-line ${isActive ? "active" : ""} ${
          isUnsynced ? "unsynced" : ""
        }`}
        onClick={handleClick}
        data-line-index={index}
      >
        <div className="richl">
          {richLyric.l.map((verse, verseIndex) => (
            <LyricWord
              key={verseIndex}
              lineIndex={index}
              verse={verse}
              verseIndex={verseIndex}
              lyric={richLyric}
              smoothTime={smoothTime}
              delayfix={delayfix}
              getWordDuration={getWordDuration!}
            />
          ))}
        </div>
        {richLyric.translation && (
          <div className="lyrics-translation">{richLyric.translation}</div>
        )}
      </h3>
    );
  } else {
    // Line Sync Lyrics
    const lineLyric = lyric as LineSyncLyricLine;
    return (
      <h3
        className={`lyric-line ${isActive ? "active" : ""} ${
          isUnsynced ? "unsynced" : ""
        }`}
        onClick={handleClick}
        data-line-index={index}
      >
        <div className="richl">{lineLyric.words}</div>
      </h3>
    );
  }
};

export default React.memo(LyricLine);
