import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import "../styles/lyrics.css";
import { LyricDots } from "./AnimatedLyrics";
import { fetchLyrics, fetchRichSyncLyrics } from "@/lib/utils";

interface RichSyncLine {
  ts: number; // start time in seconds
  te: number; // end time in seconds
  l: { c: string; o: number }[]; // lyric characters and offsets
  x: string;
}

interface LyricLine {
  startTimeMs: string;
  words: string;
}

const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

const calculateLineProgress = (
  line: RichSyncLine,
  localPlayed: number,
  delay: number
): number => {
  if (!line) return 0;

  // console.log("calculateLineProgress | localPlayed:", localPlayed);
  const adjustedTimestamp = (localPlayed + delay) * 1000; // current timestamp
  const lineStartTime = line.ts * 1000; // convert line start time to milliseconds
  const totalLineDuration = (line.te - line.ts) * 1000; // total duration of the line in milliseconds

  const elapsedTime = adjustedTimestamp - lineStartTime; // how much time has passed since the start of the line

  // Calculate raw progress
  const rawProgress = Math.min(Math.max(elapsedTime / totalLineDuration, 0), 1);

  // Apply easing function to the raw progress
  const easedProgress = easeOutCubic(rawProgress);

  return easedProgress; // return progress between 0 and 1
};

export const AnimatedRichSyncLyrics = ({
  localPlayed,
  delay = 0,
  duration,
  onSeek,
  hasRichSync = false, // Prop to conditionally use rich sync lyrics or regular lyrics
  songTitle,
  artistName,
}: {
  localPlayed: number;
  delay?: number;
  duration: number;
  onSeek: (time: number) => void;
  hasRichSync?: boolean;
  songTitle: string;
  artistName: string;
}) => {
  const [currentLine, setCurrentLine] = useState<
    RichSyncLine | LyricLine | null
  >(null);
  const currentLineRef = useRef<HTMLParagraphElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lyrics, setLyrics] = useState<{ lines: RichSyncLine[] | LyricLine[] }>(
    { lines: [] }
  );
  const [showDots, setShowDots] = useState(false);
  const [lineProgress, setLineProgress] = useState(0); // State to store line progress
  const animationRef = useRef<number | null>(null); // Store requestAnimationFrame ID

  // Fetch Rich Sync Lyrics
  const getRichSyncLyrics = async () => {
    try {
      const data = await fetchRichSyncLyrics(songTitle, artistName);
      if (!data || !data.lyrics || !data.lyrics.message.body.richsync) return;
      const richsyncBody = data.lyrics.message.body.richsync.richsync_body;
      const richsyncLines = JSON.parse(richsyncBody);
      setLyrics({ lines: richsyncLines });
    } catch (error) {
      console.error("RichSync | Error processing richsync data:", error);
      setLyrics({ lines: [] });
    }
  };

  // Fetch Regular Lyrics
  const getLyrics = async (songTitle: string, artistName: string) => {
    const data = await fetchLyrics(songTitle, artistName);
    if (!data) return;
    setLyrics(data.lyrics);
  };

  useEffect(() => {
    if (hasRichSync) {
      getRichSyncLyrics(); // Load rich sync lyrics if the prop is true
    } else {
      getLyrics(songTitle, artistName); // Load regular lyrics if the prop is false
    }
  }, [songTitle, artistName]);

  useEffect(() => {
    if (lyrics.lines.length > 0) {
      const adjustedTimestamp = (localPlayed + delay) * 1000;

      const currentLineIndex = lyrics.lines.findIndex((line, index) => {
        const nextLineStartTime = lyrics.lines[index + 1]
          ? hasRichSync
            ? (lyrics.lines[index + 1] as RichSyncLine).ts * 1000
            : Number((lyrics.lines[index + 1] as LyricLine).startTimeMs)
          : Infinity;
        return hasRichSync
          ? (line as RichSyncLine).ts * 1000 <= adjustedTimestamp &&
              adjustedTimestamp < nextLineStartTime
          : Number((line as LyricLine).startTimeMs) <= adjustedTimestamp &&
              adjustedTimestamp < nextLineStartTime;
      });

      if (currentLineIndex !== -1) {
        setCurrentLine(lyrics.lines[currentLineIndex]);
        setShowDots(false);
      } else {
        setCurrentLine(null);
        const firstLineStartTime = hasRichSync
          ? (lyrics.lines[0] as RichSyncLine).ts * 1000
          : Number((lyrics.lines[0] as LyricLine).startTimeMs);
        const isBeforeFirstLyric = adjustedTimestamp < firstLineStartTime;
        const isInGap = lyrics.lines.every((line, index) => {
          const nextLineStartTime = lyrics.lines[index + 1]
            ? hasRichSync
              ? (lyrics.lines[index + 1] as RichSyncLine).ts * 1000
              : Number((lyrics.lines[index + 1] as LyricLine).startTimeMs)
            : Infinity;
          return hasRichSync
            ? adjustedTimestamp < (line as RichSyncLine).ts * 1000 ||
                adjustedTimestamp >= nextLineStartTime
            : adjustedTimestamp < Number((line as LyricLine).startTimeMs) ||
                adjustedTimestamp >= nextLineStartTime;
        });
        setShowDots(isBeforeFirstLyric || isInGap);
      }
    }
  }, [localPlayed, delay, lyrics, hasRichSync]);

  useEffect(() => {
    if (currentLineRef.current && containerRef.current) {
      const lyricsContainer = containerRef.current;
      const lineTop = currentLineRef.current.offsetTop;
      const containerHeight = lyricsContainer.clientHeight;
      const lineHeight = currentLineRef.current.clientHeight;
      const scrollPosition = lineTop - containerHeight / 2 + lineHeight / 2;
      lyricsContainer.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentLine]);

  const handleClick = (startTime: number | string) => {
    const timeInSeconds = hasRichSync
      ? (startTime as number)
      : parseInt(startTime as string, 10) / 1000;
    onSeek(timeInSeconds);
  };

  //   const calculateLineProgress = (line: RichSyncLine): number => {
  //     if (!line || !currentLine) return 0;

  //     const adjustedTimestamp = (localPlayed + delay) * 1000; // current timestamp
  //     const lineStartTime = line.ts * 1000; // convert line start time to milliseconds
  //     const totalLineDuration = (line.te - line.ts) * 1000; // total duration of the line in milliseconds

  //     const elapsedTime = adjustedTimestamp - lineStartTime; // how much time has passed since the start of the line

  //     // Calculate progress based on elapsed time relative to the total line duration
  //     const progress = Math.min(Math.max(elapsedTime / totalLineDuration, 0), 1);
  //     return progress; // return progress between 0 and 1
  //   };

  useEffect(() => {
    const updateLineProgress = () => {
      if (currentLine) {
        const progress = calculateLineProgress(
          currentLine as RichSyncLine,
          localPlayed,
          delay
        );
        setLineProgress(progress);
      }
      animationRef.current = requestAnimationFrame(updateLineProgress);
    };

    animationRef.current = requestAnimationFrame(updateLineProgress);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [localPlayed, currentLine, delay]);

  if (lyrics.lines.length === 0) {
    return (
      <div>
        <LyricDots />
      </div>
    );
  }

  return (
    <div
      className="lyrics-container"
      style={{ overflowY: "auto", height: "55vh" }}
      ref={containerRef}
    >
      <div
        className="lyrics-view"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
        }}
      >
        {lyrics.lines.map((line, index) => {
          const isCurrentLine = hasRichSync
            ? currentLine === line
            : Number((currentLine as LyricLine)?.startTimeMs) ===
              Number((line as LyricLine).startTimeMs);

          const isPastLine = hasRichSync
            ? (line as RichSyncLine).ts < localPlayed + delay
            : Number((line as LyricLine).startTimeMs);
          (localPlayed + delay) * 1000;
          const isFirstLine = index === 0;

          const lineProgress =
            isCurrentLine && hasRichSync
              ? calculateLineProgress(line as RichSyncLine, localPlayed, delay)
              : isPastLine
              ? 1
              : 0;

          return (
            <p
              key={index}
              ref={isCurrentLine ? currentLineRef : null}
              onClick={() =>
                handleClick(
                  hasRichSync
                    ? (line as RichSyncLine).ts
                    : (line as LyricLine).startTimeMs
                )
              }
              className={clsx(
                "lyric-line lyric-word",
                isCurrentLine
                  ? "current-word"
                  : isPastLine
                  ? "finished-word"
                  : "",
                isFirstLine ? "!pt-4" : ""
              )}
              style={
                {
                  cursor: "pointer",
                  "--lyric-line-progress": lineProgress,
                } as React.CSSProperties
              }
            >
              {hasRichSync
                ? (line as RichSyncLine).l.map((part, partIndex) => (
                    <span
                      key={partIndex}
                      className={clsx(
                        "lyric-char",
                        part.c === " " ? "space" : ""
                      )}
                    >
                      {part.c === " " ? "\u00A0" : part.c}
                    </span>
                  ))
                : (line as LyricLine).words}
            </p>
          );
        })}
      </div>
    </div>
  );
};
