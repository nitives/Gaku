import React, { useEffect, useState } from "react";
import "@/styles/LyricDots.css";

interface LyricDotsProps {
  start: number;
  end: number;
  currentTime: number;
}

const LyricDots: React.FC<LyricDotsProps> = ({ start, end, currentTime }) => {
  const [active, setActive] = useState(true);
  const [dotOpacity, setDotOpacity] = useState([10, 10, 10]);

  const progress = Math.min(
    Math.max(((currentTime - start) / (end - start)) * 100, 0),
    100
  );

  useEffect(() => {
    if (progress >= 98) {
      setActive(false);
    } else {
      setActive(true);
      if (progress < 33) {
        const value = Math.floor(((progress + 10) / 33) * 100);
        setDotOpacity([value, 10, 10]);
      } else if (progress < 66) {
        const value = Math.floor(((progress + 10 - 33) / 33) * 100);
        setDotOpacity([100, value, 10]);
      } else {
        const value = Math.floor(((progress + 10 - 66) / 33) * 100);
        setDotOpacity([100, 100, value]);
      }
    }
  }, [progress]);

  const getDotStyle = (index: number) => ({
    opacity: dotOpacity[index] / 100,
  });

  return (
    <div className={`lyric-dots ${!active ? "clear" : ""}`}>
      <div className="dot dot-1" style={getDotStyle(0)}></div>
      <div className="dot dot-2" style={getDotStyle(1)}></div>
      <div className="dot dot-3" style={getDotStyle(2)}></div>
    </div>
  );
};

export default LyricDots;
