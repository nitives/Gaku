import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchRichSyncLyrics, fetchLyrics } from "@/lib/utils";
import "@/styles/LyricsView.css";
import LyricLine from "./LyricLine";
import { motion } from "framer-motion";

interface RichSyncLyricLine {
  ts: number; // start time in seconds
  te: number; // end time in seconds
  l: { c: string; o: number }[]; // lyric characters and offsets
  x?: string;
  translation?: string;
}

interface LineSyncLyricLine {
  startTimeMs: string;
  words: string;
  endTimeMs: string;
}

interface RichSyncLyrics {
  syncType: "WORD_SYNCED";
  lines: RichSyncLyricLine[];
  provider?: string;
  timingType?: string;
  language?: string;
}

interface LineSyncLyrics {
  syncType: "LINE_SYNCED";
  lines: LineSyncLyricLine[];
  provider?: string;
  timingType?: string;
  language?: string;
}

type LyricsData = RichSyncLyrics | LineSyncLyrics;

interface LyricsViewProps {
  time: number;
  yoffset?: number;
  seekTo: (time: number) => void;
  playing: boolean;
  sourceInfo?: {
    provider: string;
    timingType: string;
    language: string;
  };
  songTitle: string;
  artistName: string;
  duration: number; // Duration of the song in seconds
}

const LyricsView: React.FC<LyricsViewProps> = ({
  time,
  yoffset = 128,
  seekTo,
  playing,
  sourceInfo,
  songTitle,
  artistName,
  duration,
}) => {
  const lyricsViewRef = useRef<HTMLDivElement>(null);
  const [currentLyricsLine, setCurrentLyricsLine] = useState<number>(-1);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);

  const delayfix = 0.8; // Adjust if necessary

  // Introduce smoothTime state
  const [smoothTime, setSmoothTime] = useState(time);

  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const initialTimeRef = useRef<number>(time);

  // Cache lyrics data
  const lyricsCache = useRef<{ [key: string]: LyricsData | null }>({});

  const requestIdRef = useRef(0);

  useEffect(() => {
    const cacheKey = `${songTitle}-${artistName}`;
    if (lyricsCache.current[cacheKey]) {
      setLyrics(lyricsCache.current[cacheKey]);
    } else {
      let isCancelled = false;
      const currentRequestId = ++requestIdRef.current;

      const fetchLyricsData = async () => {
        const richSyncLyrics = await getRichSyncLyrics(songTitle, artistName);
        if (isCancelled || currentRequestId !== requestIdRef.current) return;

        if (richSyncLyrics && richSyncLyrics.lines.length > 0) {
          lyricsCache.current[cacheKey] = richSyncLyrics;
          setLyrics(richSyncLyrics);
        } else {
          const lineSyncLyrics = await getLineSyncLyrics(songTitle, artistName);
          if (isCancelled || currentRequestId !== requestIdRef.current) return;

          if (lineSyncLyrics && lineSyncLyrics.lines.length > 0) {
            lyricsCache.current[cacheKey] = lineSyncLyrics;
            setLyrics(lineSyncLyrics);
          } else {
            lyricsCache.current[cacheKey] = null;
            setLyrics(null);
          }
        }
      };

      fetchLyricsData();

      return () => {
        isCancelled = true;
      };
    }
  }, [songTitle, artistName]);

  // Fetch functions
  const getRichSyncLyrics = async (
    songTitle: string,
    artistName: string
  ): Promise<RichSyncLyrics | null> => {
    try {
      // console.log(
      //   `fetchRichSyncLyrics | artist and title:", ${artistName} - ${songTitle})`
      // );
      const data = await fetchRichSyncLyrics(songTitle, artistName);
      if (!data || !data.lyrics || !data.lyrics.message.body.richsync)
        return null;
      const richsyncBody = data.lyrics.message.body.richsync.richsync_body;
      const richsyncLines: RichSyncLyricLine[] = JSON.parse(richsyncBody);
      return {
        syncType: "WORD_SYNCED",
        lines: richsyncLines,
        provider: data.lyrics.providerDisplayName,
        timingType: data.lyrics.syncType,
        language: data.lyrics.language,
      };
    } catch (error) {
      console.error("RichSync | Error processing richsync data:", error);
      return null;
    }
  };

  const getLineSyncLyrics = async (
    songTitle: string,
    artistName: string
  ): Promise<LineSyncLyrics | null> => {
    try {
      // console.log(
      //   `fetchLyrics | artist and title:", ${artistName} - ${songTitle})`
      // );
      const data = await fetchLyrics(songTitle, artistName);
      if (!data || !data.lyrics || !data.lyrics.lines) return null;
      const lines = data.lyrics.lines;
      return {
        syncType: "LINE_SYNCED",
        lines: lines,
        provider: data.lyrics.providerDisplayName,
        timingType: data.lyrics.syncType,
        language: data.lyrics.language,
      };
    } catch (error) {
      console.error("LineSync | Error processing line sync data:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!lyrics) return;

    const update = () => {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000; // Convert to seconds
      setSmoothTime(initialTimeRef.current + elapsed);

      if (playing) {
        rafIdRef.current = requestAnimationFrame(update);
      }
    };

    if (playing) {
      startTimeRef.current = performance.now();
      initialTimeRef.current = time;
      rafIdRef.current = requestAnimationFrame(update);
    } else {
      // If paused, cancel the animation loop and set smoothTime to current time
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setSmoothTime(time);
    }

    // Clean up when the component unmounts or when playing changes
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [playing, time, lyrics]);

  useEffect(() => {
    if (!lyrics) return;
    getActiveLyric();
  }, [smoothTime, lyrics]);

  const getActiveLyric = useCallback(() => {
    if (!lyrics) return;

    for (let i = 0; i < lyrics.lines.length; i++) {
      let lineStartTime: number;
      let lineEndTime: number;

      if (lyrics.syncType === "WORD_SYNCED") {
        const line = lyrics.lines[i] as RichSyncLyricLine;
        lineStartTime = line.ts;
        lineEndTime = line.te;
      } else {
        const line = lyrics.lines[i] as LineSyncLyricLine;
        lineStartTime = parseInt(line.startTimeMs) / 1000;
        if (i < lyrics.lines.length - 1) {
          const nextLine = lyrics.lines[i + 1] as LineSyncLyricLine;
          lineEndTime = parseInt(nextLine.startTimeMs) / 1000;
        } else {
          lineEndTime = duration;
        }
      }

      if (
        smoothTime + delayfix >= lineStartTime &&
        smoothTime + delayfix <= lineEndTime
      ) {
        if (currentLyricsLine !== i) {
          setCurrentLyricsLine(i);
          scrollToActiveLine(i);
        }
        break;
      }
    }
  }, [smoothTime, lyrics, currentLyricsLine, delayfix, duration]);

  const scrollToActiveLine = useCallback(
    (lineIndex: number) => {
      if (isUserScrolling) return;

      if (lyricsViewRef.current) {
        const activeLine = lyricsViewRef.current.querySelector<HTMLDivElement>(
          `.lyric-line[data-line-index='${lineIndex}']`
        );
        if (activeLine) {
          activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    },
    [isUserScrolling]
  );

  const handleUserScroll = useCallback(() => {
    setIsUserScrolling(true);
    const timeoutId = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const lyricsContainer = lyricsViewRef.current;
    if (lyricsContainer) {
      lyricsContainer.addEventListener("scroll", handleUserScroll);
    }

    return () => {
      if (lyricsContainer) {
        lyricsContainer.removeEventListener("scroll", handleUserScroll);
      }
    };
  }, [handleUserScroll]);

  const getWordDuration = useCallback(
    (lineIndex: number, wordIndex: number): number => {
      if (!lyrics || lyrics.syncType !== "WORD_SYNCED") return 0.1;

      const line = lyrics.lines[lineIndex] as RichSyncLyricLine;
      const word = line.l[wordIndex];
      const wordStartTime = line.ts + word.o;

      let wordEndTime: number;

      // Check if there is a next word in the same line
      if (wordIndex + 1 < line.l.length) {
        const nextWord = line.l[wordIndex + 1];
        wordEndTime = line.ts + nextWord.o;
      } else {
        wordEndTime = line.te;
      }

      let duration = wordEndTime - wordStartTime;

      // Ensure minimum duration
      if (duration <= 0) {
        duration = 0.1; // Minimum duration of 0.1 seconds
      }

      return duration;
    },
    [lyrics]
  );

  if (!lyrics) {
    const loadingContainerVariants = {
      start: {
        transition: {
          staggerChildren: 0.2,
        },
      },
      end: {
        transition: {
          staggerChildren: 0.2,
        },
      },
    };

    const loadingCircleVariants = {
      start: {
        y: "0%",
      },
      end: {
        y: "100%",
      },
    };

    const loadingCircleTransition = {
      duration: 0.5,
      yoyo: Infinity,
      ease: "easeInOut",
    };

    return (
      <div className="lyrics-container pt-5">
        <p>Loading lyrics...</p>
      </div>
    );
  }

  return (
    <div ref={lyricsViewRef} className="md-body lyric-body lyrics-container">
      {lyrics.lines.map((lyric, index) => {
        const isActive = index === currentLyricsLine;
        const isUnsynced = false; // Adjust if needed

        return (
          <LyricLine
            key={index}
            index={index}
            lyric={lyric}
            isActive={isActive}
            isUnsynced={isUnsynced}
            seekTo={seekTo}
            smoothTime={smoothTime}
            delayfix={delayfix}
            getWordDuration={getWordDuration}
            syncType={lyrics.syncType}
          />
        );
      })}
      {/* Display source information if available */}
      {sourceInfo && (
        <div className="source-info">
          <p>
            {sourceInfo.provider} - {sourceInfo.timingType} (
            {sourceInfo.language})
          </p>
        </div>
      )}
    </div>
  );
};

export default LyricsView;
