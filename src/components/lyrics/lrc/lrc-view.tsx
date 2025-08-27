"use client";
import { Fragment, RefObject, useEffect, useRef, useState } from "react";
import LrcLine from "./lrc-line";
import ReactPlayer from "react-player";
import { AppleKit } from "@/lib/audio/fetchers";
import { parseTTML } from "./utils/TTMLparser";

interface Props {
  audioRef: RefObject<HTMLAudioElement> | React.RefObject<ReactPlayer> | null;
  currentTime: number;
  title: string;
  artist: string;
}

const LrcView = ({ currentTime, title, artist }: Props) => {
  const [parsedJson, setParsedJson] = useState<any>(null);

  // Create a ref for the scrollable container
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLyrics = async () => {
      const lyrics = await AppleKit.getLyrics(title, artist);
      const parsedJson = parseTTML(lyrics as string);
      setParsedJson(parsedJson);
    };
    fetchLyrics();
  }, [title]);

  useEffect(() => {
    // On each time update, scroll the current line into view
    if (!containerRef.current) return;

    // Find the current line
    const currentLine = containerRef.current.querySelector(".active");
    if (currentLine) {
      currentLine.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentTime]);

  if (!parsedJson?.body.div) {
    return (
      <div className="primary-vocals translate-y-1/2 max-w-4xl mx-auto flex-1">
        <p className="text-center">No lyrics found</p>
      </div>
    );
  }

  return (
    // Make sure this container is scrollable if content exceeds its size
    <div
      ref={containerRef}
      className="primary-vocals my-16 max-w-4xl mx-auto flex-1 overflow-auto"
      style={{ maxHeight: "80vh" }} // Adjust as needed
    >
      {parsedJson.body.div.map((div: any, i: any) => (
        <Fragment key={i}>
          {div.p.map((p: any, idx: any) => (
            <LrcLine
              key={idx}
              currentTime={currentTime}
              begin={p["@begin"]}
              end={p["@end"]}
              span={p.span as any}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
};

export default LrcView;
