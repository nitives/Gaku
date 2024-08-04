import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { fetchLyrics } from "@/lib/utils";
import "../styles/lyrics.css";
import { motion, AnimatePresence } from "framer-motion";
// import { lyrics } from "./lyrics.json";

const LyricDots = () => (
  <motion.div
    layout
    className="size-fit"
    initial={{ scale: 0, opacity: 0, marginBottom: "0px" }}
    animate={{ scale: 1, opacity: 1, marginBottom: "0px" }}
    exit={{ scale: 0.8, opacity: 0, marginBottom: "-22px" }}
    transition={{ duration: 0.3 }}
  >
    <motion.div className="lyric-dots">
      <div className="dot dot-1">
        <div className="svg-dot">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </div>
      </div>
      <div className="dot dot-2">
        <div className="svg-dot">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </div>
      </div>
      <div className="dot dot-3">
        <div className="svg-dot">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

interface LyricLine {
  startTimeMs: string;
  words: string;
}

export const AnimatedLyrics = ({
  localPlayed,
  delay = 0,
  onSeek,
  songTitle,
  artistName,
}: {
  localPlayed: number;
  delay?: number;
  onSeek: (time: number) => void;
  songTitle: string;
  artistName: string;
}) => {
  const [currentLine, setCurrentLine] = useState(null);
  const currentLineRef = useRef<HTMLParagraphElement | null>(null);
  const [lyrics, setLyrics] = useState<{ lines: LyricLine[] }>({ lines: [] });
  const [showDots, setShowDots] = useState(false);

  const getLyrics = async (songTitle: string, artistName: string) => {
    const data = await fetchLyrics(songTitle, artistName);
    setLyrics(data.lyrics);
    // console.log("getLyrics | data:", data.lyrics);
  };

  useEffect(() => {
    const fetchSongLyrics = async () => {
      await getLyrics(songTitle, artistName);
    };
    fetchSongLyrics();
  }, [songTitle, artistName]);

  useEffect(() => {
    if (lyrics && lyrics.lines.length > 0) {
      const adjustedTimestamp = (localPlayed + delay) * 1000;

      const currentLineIndex = lyrics.lines.findIndex((line, index) => {
        const nextLineStartTime = lyrics.lines[index + 1]
          ? Number(lyrics.lines[index + 1].startTimeMs)
          : Infinity;
        return (
          Number(line.startTimeMs) <= adjustedTimestamp &&
          adjustedTimestamp < nextLineStartTime
        );
      });

      if (currentLineIndex !== -1) {
        setCurrentLine(lyrics.lines[currentLineIndex]);
        setShowDots(false); // Hide dots when a lyric line is active
      } else {
        setCurrentLine(null);
        // Show dots if we're before the first lyric or in a gap between lyrics
        const firstLineStartTime = Number(lyrics.lines[0].startTimeMs);
        const isBeforeFirstLyric = adjustedTimestamp < firstLineStartTime;
        const isInGap = lyrics.lines.every((line, index) => {
          const nextLineStartTime = lyrics.lines[index + 1]
            ? Number(lyrics.lines[index + 1].startTimeMs)
            : Infinity;
          return (
            adjustedTimestamp < Number(line.startTimeMs) ||
            adjustedTimestamp >= nextLineStartTime
          );
        });
        setShowDots(isBeforeFirstLyric || isInGap);
      }
    }
  }, [localPlayed, delay, lyrics]);

  useEffect(() => {
    // console.log("current LineRef Before:", currentLineRef.current);
    if (currentLineRef.current) {
      // console.log("current LineRef | After:", currentLineRef.current);
      currentLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      // console.log("current LineRef | scrolled to", currentLineRef.current);
    }
  }, [currentLine]);

  const handleClick = (startTimeMs: string) => {
    const timeInSeconds = parseInt(startTimeMs, 10) / 1000;
    onSeek(timeInSeconds);
  };

  if (!lyrics) {
    return <div>Loading lyrics...</div>;
  }

  return (
    <div
      className="lyrics-container rounded-2xl !mx-2"
      style={{ overflowY: "auto", height: "60vh" }}
    >
      <div
        className="lyrics-view pt-20"
        style={{
          paddingTop: "40px",
          padding: "20px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
        }}
      >
        <AnimatePresence>{showDots && <LyricDots />}</AnimatePresence>
        {lyrics.lines.map((line: { startTimeMs: number; words: string }) => {
          const isCurrentLine = currentLine?.startTimeMs === line.startTimeMs;
          const isPastLine =
            Number(line.startTimeMs) < (localPlayed + delay) * 1000;

          return (
            <p
              key={line.startTimeMs}
              ref={isCurrentLine ? currentLineRef : null}
              onClick={() => handleClick(line.startTimeMs)}
              className={clsx(
                "lyric-line has-syllables",
                isCurrentLine ? "active" : isPastLine ? "finished" : ""
              )}
              style={{ cursor: "pointer" }}
            >
              {line.words}
            </p>
          );
        })}
      </div>
    </div>
  );
};
