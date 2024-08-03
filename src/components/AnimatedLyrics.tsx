import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { lyrics } from "./lyrics.json";

export const AnimatedLyrics = ({
  localPlayed,
  delay = 0, // Adding the delay prop
  onSeek,
}: {
  localPlayed: number;
  delay?: number;
  onSeek: (time: number) => void;
}) => {
  const [currentLine, setCurrentLine] = useState(null);
  const currentLineRef = useRef<HTMLParagraphElement | null>(null);

  // Determine the current line based on the current timestamp with delay applied
  useEffect(() => {
    const adjustedTimestamp = (localPlayed + delay) * 1000; // Apply delay and convert to milliseconds

    const nextLineIndex = lyrics.lines.findIndex(
      (line) => Number(line.startTimeMs) > adjustedTimestamp
    );

    if (nextLineIndex === 0) {
      setCurrentLine(lyrics.lines[0]);
    } else {
      setCurrentLine(lyrics.lines[nextLineIndex - 1]);
    }
  }, [localPlayed, delay]);

  // Scroll to the active line
  useEffect(() => {
    if (currentLineRef.current) {
      currentLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLine]);

  // Handle clicks on lyrics to jump to the specific time
  const handleClick = (startTimeMs: string) => {
    const timeInSeconds = parseInt(startTimeMs, 10) / 1000;
    onSeek(timeInSeconds);
  };

  return (
    <div
      className="lyrics-container"
      style={{ overflowY: "auto", height: "120vh" }}
    >
      <div
        style={{
          padding: "20px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          justifyContent: "center",
        }}
      >
        {lyrics.lines.map((line, index) => {
          const isCurrentLine = currentLine?.startTimeMs === line.startTimeMs;
          const isPastLine =
            Number(line.startTimeMs) < (localPlayed + delay) * 1000;

          return (
            <p
              key={line.startTimeMs}
              ref={isCurrentLine ? currentLineRef : null}
              onClick={() => handleClick(line.startTimeMs)}
              className={clsx(
                "text-2xl relative scale-100 font-bold transition-all duration-300 py-1",
                isCurrentLine
                  ? "text-[var(--ambient)] left-[14.5rem] scale-150 !py-4"
                  : isPastLine
                  ? "text-black/25"
                  : "text-black/40"
              )}
              style={{
                cursor: "pointer",
              }}
            >
              {line.words}
            </p>
          );
        })}
      </div>
    </div>
  );
};
