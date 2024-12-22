import Syllable from "./lrc-syllable";
import cn from "classnames";
import { useState, useEffect } from "react";
import { parseMills } from "./utils/lyricUtils";

interface Props {
  currentTime: number;
  begin: string;
  end: string;
  span: {
    "@begin": string;
    "@end": string;
    "#text": string;
  }[];
}

const LrcLine = ({ currentTime, begin, end, span }: Props) => {
  const [hasBeenCurrent, setHasBeenCurrent] = useState(false);
  const beginMills = parseMills(begin);
  const endMills = parseMills(end);
  const alreadyShown = currentTime > Number(endMills);
  const isCurrent =
    currentTime >= Number(beginMills) && currentTime <= Number(endMills);

  useEffect(() => {
    if (isCurrent && !hasBeenCurrent) {
      // Once line is current at least once, set hasBeenCurrent
      setHasBeenCurrent(true);
    }
  }, [isCurrent, hasBeenCurrent]);

  return (
    <button
      begin={begin}
      end={end}
      className={cn(
        "block !mb-14 text-left",
        hasBeenCurrent && "current", // keep "current" once line has ever been active
        isCurrent && "active" // "active" only while currently active
      )}
    >
      {span.map((span, j) => (
        <Syllable
          key={j}
          currentTime={currentTime}
          begin={span["@begin"]}
          end={span["@end"]}
          text={span["#text"]}
        />
      ))}
    </button>
  );
};

export default LrcLine;
