// import React, { useState, useEffect, useRef } from "react";
// import { motion, useAnimation } from "framer-motion";
// import "../../styles/TitleOverflowAnimator.css";

// export const TitleOverflowAnimator: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [isOverflowing, setIsOverflowing] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const contentRef = useRef<HTMLDivElement>(null);
//   const controls = useAnimation();

//   useEffect(() => {
//     const container = containerRef.current;
//     const content = contentRef.current;
//     const screenWidth = window.innerWidth;
//     setIsOverflowing(screenWidth < 500);
//     // console.log("marquee | screenWidth:", screenWidth);
//     // console.log("marquee | is screenWidth under 500px?", screenWidth < 500);

//     if (isOverflowing) {
//       // console.log("marquee | isContentOverflowing:", isOverflowing);
//       if (container && content) {
//         const containerWidth = window.innerWidth * 0.45; // Fixed container width
//         const contentWidth = content.scrollWidth;
//         // console.log("marquee | contentWidth:", contentWidth);
//         const isContentOverflowing = containerWidth;
//         // console.log("marquee | container && content:", container && content);

//         if (isContentOverflowing) {
//           // console.log("contentWidth:", contentWidth);
//           const singleCopyWidth = contentWidth / 2;
//           // console.log("singleCopyWidth:", singleCopyWidth);
//           const animationDistance = singleCopyWidth;
//           // console.log("animationDistance:", animationDistance);
//           const animationDuration = animationDistance / 45  ; // Adjust speed as needed
//           // console.log("animationDuration:", animationDuration);

//           setTimeout(() => {
//             controls.start({
//               x: [-0, -animationDistance],
//               transition: {
//                 duration: animationDuration,
//                 ease: "linear",
//                 repeat: Infinity,
//                 repeatDelay: 10,
//                 delay: 1,
//               },
//             });
//           }, 1000); // 5 second delay before animation starts
//         }
//       }
//     } else {
//       controls.stop();
//     }
//   }, [children, controls, isOverflowing, setIsOverflowing]);

//   return (
//     <div className="marquee-container" ref={containerRef}>
//       <motion.div
//         className="marquee-content"
//         ref={contentRef}
//         animate={controls}
//       >
//         <span>{children}</span>
//         {isOverflowing && <span>{children}</span>}
//       </motion.div>
//     </div>
//   );
// };

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "../../styles/TitleOverflowAnimator.css";

export const TitleOverflowAnimator: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
  };

  return (
    <div className="marquee-container">
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
