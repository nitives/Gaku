import { getGradientPercentage, parseMills } from "./utils/lyricUtils";
import { motion } from "framer-motion";

interface Props {
  currentTime: number;
  begin: string;
  end: string;
  text: string;
}

const Syllable = ({ currentTime, begin, end, text }: Props) => {
  const beginMills = parseMills(begin || "");
  const endMills = parseMills(end || "");
  const style: Record<string, string> = {};
  const startTime = Number(beginMills);
  const endTime = Number(endMills);
  const duration = endTime - startTime;
  const isActive = currentTime >= startTime && currentTime <= endTime;
  const isGone = currentTime > endTime;
  const longLasting = duration > 0.5;

  if (isActive) {
    style["--gradient-progress"] = getGradientPercentage(
      currentTime,
      +beginMills,
      +endMills
    );
  } else if (isGone) {
    style["--gradient-progress"] = "100%";
  } else {
    style["--gradient-progress"] = "0%";
  }

  let baseScale = 1;
  if (isActive && longLasting) {
    const growthRate = 0.18;
    baseScale = 1.05 + (duration - 0.5) * growthRate;
    baseScale = Math.min(baseScale, 1.15);
  } else if (isGone) {
    baseScale = 1;
  }

  // If active and longLasting, scale: [1, baseScale, 1]
  // Otherwise just baseScale.
  const animateScale = isActive && longLasting ? [1, baseScale, 1] : baseScale;

  // Make the total animation duration depend on the duration of the syllable.
  const extraTime = duration > 0.5 ? (duration - 0.5) * 1 : 0;
  const animationDuration = 0.5 + extraTime;

  const glow = [
    "0px 0px 10px rgba(255, 255, 255, 0)",
    "0px 0px 5px rgba(255, 255, 255, 0.3)",
    "0px 0px 3px rgba(255, 255, 255, 0.6)",
    "0px 0px 1px rgba(255, 255, 255, 1)",
    "0px 0px 20px rgba(255, 255, 255, 0.6)",
    "0px 0px 5px rgba(255, 255, 255, 0.3)",
    "0px 0px 10px rgba(255, 255, 255, 0)",
  ].join(", ");

  const glowOff = [
    "0px 0px 10px rgba(255, 255, 255, 0)",
    "0px 0px 5px rgba(255, 255, 255, 0)",
    "0px 0px 3px rgba(255, 255, 255, 0)",
    "0px 0px 1px rgba(255, 255, 255, 0)",
    "0px 0px 20px rgba(255, 255, 255, 0)",
    "0px 0px 5px rgba(255, 255, 255, 0)",
    "0px 0px 10px rgba(255, 255, 255, 0)",
  ].join(", ");

  return (
    <motion.span
      className="syllable inline-block"
      begin={begin}
      end={end}
      style={style}
      initial={{ y: 0 }}
      animate={{
        y: isActive || isGone ? -2 : 0,
        scale: animateScale,
        textShadow:
          isActive && longLasting
            ? [glowOff, glow, glowOff]
            : "0px 0px 0px rgba(255, 255, 255, 0)",
      }}
      transition={{
        duration: isActive && longLasting ? animationDuration : 0.33,
        ease: "easeOut",
        times: isActive && longLasting ? [0, 0.5, 1] : undefined,
      }}
    >
      {text}
    </motion.span>
  );
};

export default Syllable;
