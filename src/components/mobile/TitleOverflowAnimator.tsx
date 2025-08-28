import { useEffect, useRef, useState } from "react";
import { motion, MotionProps } from "motion/react";
import "../../styles/TitleOverflowAnimator.css";

export const TitleOverflowAnimator: React.FC<{
  children: React.ReactNode;
  className?: string | null;
}> = ({ children, className }) => {
  const child = useRef<HTMLSpanElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (child.current) {
      const measuredWidth = child.current.scrollWidth;
      const windowWidthThreshold = window.innerWidth * 0.5;

      // Check if the content width exceeds half of the window's width
      if (measuredWidth > windowWidthThreshold) {
        setIsOverflowing(true);
        setContentWidth(measuredWidth * 2); // Double width for both spans
      } else {
        setIsOverflowing(false);
        setContentWidth(measuredWidth); // Single span width
      }

      // Set the content width to a CSS variable called --overflow-title-width
      document.documentElement.style.setProperty(
        "--overflow-title-width",
        `${measuredWidth}px`
      );
    }
  }, [children]);

  const marqueeVariants = {
    animate: {
      x: isOverflowing ? [0, -contentWidth / 2] : [0], // Only animate if overflowing
      transition: isOverflowing
        ? {
            delay: 5,
            duration: 10, // Adjust the duration to control the speed of the animation
            ease: "linear",
            repeat: Infinity, // Loop the animation infinitely
            repeatDelay: 5, // Delay between each loop
          }
        : {}, // No animation if not overflowing
    },
  } satisfies MotionProps;

  return (
    <div className={`marquee-container ${className}`}>
      <motion.div
        className="marquee-content"
        variants={marqueeVariants}
        animate="animate"
        style={{ width: isOverflowing ? `${contentWidth}px` : "auto" }} // Ensure the container is wide enough
      >
        <span ref={child}>{children}</span>
        {isOverflowing && <span>{children}</span>}{" "}
        {/* Duplicate only if overflowing */}
      </motion.div>
    </div>
  );
};
