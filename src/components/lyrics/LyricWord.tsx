import React, { useMemo, useEffect } from "react";

interface RichSyncLyricLine {
  ts: number; // Start time in seconds
  te: number; // End time in seconds
  l: { c: string; o: number }[]; // Characters and their offsets
}

interface LyricWordProps {
  lineIndex: number;
  verseIndex: number;
  verse: { c: string; o: number };
  lyric: RichSyncLyricLine;
  smoothTime: number;
  delayfix: number;
  getWordDuration: (lineIndex: number, wordIndex: number) => number;
}

const LyricWord: React.FC<LyricWordProps> = ({
  lineIndex,
  verseIndex,
  verse,
  lyric,
  smoothTime,
  delayfix,
  getWordDuration,
}) => {
  const wordStartTime = lyric.ts + verse.o;
  const wordDuration = getWordDuration(lineIndex, verseIndex);

  // Define an epsilon to prevent overlapping activations
  const epsilon = 0.05; // 50ms buffer

  // Determine if the word is active based on current time
  const isWordActive =
    smoothTime + delayfix >= wordStartTime &&
    smoothTime + delayfix < wordStartTime + wordDuration - epsilon;

  // Determine if the word is completed
  const isWordCompleted =
    smoothTime + delayfix >= wordStartTime + wordDuration - epsilon;

  // Assign appropriate CSS classes based on word state
  let wordClassName = "word";
  if (isWordActive) {
    wordClassName += " word-active";
  } else if (isWordCompleted) {
    wordClassName += " word-completed";
  }

  // Determine if a space should be added before this word
  const addSpaceBefore = verseIndex > 0;

  // Split the word into individual characters
  const characters = useMemo(() => Array.from(verse.c), [verse.c]);

  // Count non-space characters for animation timing
  const nonSpaceCharCount = useMemo(
    () => characters.filter((char) => char !== " ").length,
    [characters]
  );

  // Calculate duration for each character's animation
  const charDuration =
    nonSpaceCharCount > 0 ? wordDuration / nonSpaceCharCount : wordDuration;

  // Calculate word progress as a percentage (0% to 100%)
  const wordProgress = useMemo(() => {
    if (isWordActive) {
      const progress =
        ((smoothTime + delayfix - wordStartTime) / wordDuration) * 100;
      // Clamp the progress between 0% and 100%
      return `${Math.min(Math.max(progress, 0), 100)}%`;
    } else if (isWordCompleted) {
      return "100%";
    } else {
      return "0%";
    }
  }, [
    isWordActive,
    isWordCompleted,
    smoothTime,
    delayfix,
    wordStartTime,
    wordDuration,
  ]);

  // Debugging: Log the active state and progress
  useEffect(() => {
    console.log(
      `Word [Line ${lineIndex} Word ${verseIndex}]: Active=${isWordActive}, Completed=${isWordCompleted}, Progress=${wordProgress}`
    );
  }, [isWordActive, isWordCompleted, wordProgress, lineIndex, verseIndex]);

  return (
    <React.Fragment>
      {addSpaceBefore && <span className="word-space"> </span>}
      <span
        className={wordClassName}
        data-start-time={wordStartTime}
        data-duration={wordDuration}
        style={
          isWordActive || isWordCompleted
            ? ({
                "--word-duration": `${wordDuration}s`,
                "--bgProgress": wordProgress,
                "--char-count": nonSpaceCharCount,
                "--char-duration": `${charDuration}s`,
              } as React.CSSProperties)
            : {}
        }
      >
        {characters.map((char, charIndex) => {
          if (char === " ") {
            // Render space without animation
            return (
              <span key={charIndex} className="char space">
                {char}
              </span>
            );
          } else {
            // Calculate animation delay for non-space characters
            const nonSpaceIndex = characters
              .slice(0, charIndex)
              .filter((c) => c !== " ").length;
            const charDelay = nonSpaceIndex * charDuration;

            return (
              <span
                key={charIndex}
                className="char"
                style={
                  isWordActive
                    ? ({
                        "--char-animation-delay": `${charDelay}s`,
                      } as React.CSSProperties)
                    : {}
                }
              >
                {char}
              </span>
            );
          }
        })}
      </span>
    </React.Fragment>
  );
};

export default React.memo(LyricWord);
