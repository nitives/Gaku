"use client";

import React, { useRef, useEffect, memo } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import style from "./PlayerBar.module.css";
import { useThemedPlaceholder } from "@/lib/utils/themedPlaceholder";

interface ArtworkProps {
  src: string;
}

/**
 * Slower overshoot flip:
 *   forcibly sets rotateY=0, then 0→240→180
 *   blurVal from 10→0 over 1s
 */
function ArtworkComponent({ src }: ArtworkProps) {
  const THEMED_DEFAULT_IMAGE = useThemedPlaceholder();
  const finalSrc = src || THEMED_DEFAULT_IMAGE;
  const oldSrcRef = useRef(finalSrc);

  // Animate rotateY and blur values
  const rotateY = useMotionValue(0);
  const blurVal = useMotionValue(0);
  const filter = useTransform(blurVal, (val) => `blur(${val}px)`);

  useEffect(() => {
    if (finalSrc !== oldSrcRef.current) {
      // Reset rotation and set initial blur
      rotateY.set(0);
      const duration = 1;
      blurVal.set(5);
      animate(blurVal, 0, { duration });

      // Animate rotation with overshoot
      (async () => {
        await animate(rotateY, 180, {
          type: "spring",
          stiffness: 60,
          damping: 15,
          mass: 1.5,
          duration,
        });
        await animate(rotateY, 180, {
          type: "spring",
          stiffness: 60,
          damping: 15,
          mass: 1.5,
          duration,
        });
      })();

      oldSrcRef.current = finalSrc;
    }
  }, [finalSrc, rotateY, blurVal]);

  return (
    <motion.div
      className={style.Artwork}
      style={{
        rotateY,
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          filter: filter as any,
        }}
      >
        {/* FRONT image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "visible",
          }}
        >
          <Image
            src={finalSrc}
            alt="Artwork Front"
            fill
            draggable={false}
            placeholder="blur"
            blurDataURL={THEMED_DEFAULT_IMAGE}
            onError={(e) => {
              e.currentTarget.src = THEMED_DEFAULT_IMAGE;
            }}
          />
        </div>

        {/* BACK image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotateY(180deg)",
            backfaceVisibility: "visible",
          }}
        >
          <Image
            src={finalSrc}
            alt="Artwork Back"
            fill
            draggable={false}
            placeholder="blur"
            blurDataURL={THEMED_DEFAULT_IMAGE}
            onError={(e) => {
              e.currentTarget.src = THEMED_DEFAULT_IMAGE;
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Memoize the component, only re-render if `src` changes
export const Artwork = memo(ArtworkComponent, (prev, next) => {
  return prev.src === next.src;
});
