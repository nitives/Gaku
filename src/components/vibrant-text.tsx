"use client";

import React, {
  forwardRef,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

type VibrancyType =
  | "ultraThin"
  | "thin"
  | "regular"
  | "thick"
  | "prominent"
  | "custom";

const VIBRANCY_FILTERS: Record<VibrancyType, string> = {
  ultraThin: "blur(12px) brightness(140%) saturate(160%) contrast(90%)",
  thin: "blur(18px) brightness(150%) saturate(180%) contrast(88%)",
  regular: "blur(24px) brightness(160%) saturate(200%) contrast(85%)",
  thick: "blur(32px) brightness(170%) saturate(220%) contrast(82%)",
  prominent: "blur(40px) brightness(180%) saturate(240%) contrast(80%)",
  custom: "",
};

export interface VibrantTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  children: any;
  /** e.g. "rgba(172, 59, 59, 0.5)" */
  tint?: string;
  /** Preset for --TextVibrancySettings; use "custom" to override via wrapper style */
  vibrancyType?: VibrancyType;
}

/** Inline styles */
const S = {
  parent: {
    position: "relative",
    display: "inline-grid",
    width: "var(--vtxt-w)",
    height: "var(--vtxt-h)",
    color: "inherit",
  } as React.CSSProperties,
  svgHidden: {
    position: "absolute",
    width: 0,
    height: 0,
    overflow: "hidden",
  } as React.CSSProperties,
  blur: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background: "var(--TextVibrancyTint)",
    backdropFilter: "var(--TextVibrancySettings)",
    WebkitBackdropFilter: "var(--TextVibrancySettings)",
  } as React.CSSProperties,
  readable: {
    position: "relative",
    display: "inline-block",
    width: "var(--vtxt-w)",
    height: "var(--vtxt-h)",
    whiteSpace: "nowrap",
    font: "inherit",
    lineHeight: "var(--vtxt-h)",
    color: "transparent",
    userSelect: "text",
    WebkitUserSelect: "text",
  } as React.CSSProperties,
  measureSvg: {
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
    width: 0,
    height: 0,
  } as React.CSSProperties,
};

export const VibrantText = forwardRef<HTMLSpanElement, VibrantTextProps>(
  (
    { children, className, tint, vibrancyType = "regular", style, ...rest },
    ref
  ) => {
    const clipId = useId().replace(/:/g, "_");
    const wrapRef = useRef<HTMLDivElement>(null);
    const measureTextRef = useRef<SVGTextElement>(null);

    const filterString = useMemo(
      () => VIBRANCY_FILTERS[vibrancyType] ?? VIBRANCY_FILTERS.regular,
      [vibrancyType]
    );

    useLayoutEffect(() => {
      const measure = () => {
        const t = measureTextRef.current;
        const wrap = wrapRef.current;
        if (!t || !wrap) return;
        const bbox = t.getBBox();
        wrap.style.setProperty("--vtxt-w", Math.ceil(bbox.width) + "px");
        wrap.style.setProperty("--vtxt-h", Math.ceil(bbox.height) + "px");
        wrap.style.setProperty("--vtxt-ty", -bbox.y + "px"); // baseline → top
      };

      measure();

      const ro = new ResizeObserver(measure);
      if (wrapRef.current) ro.observe(wrapRef.current);
      document?.fonts?.ready.then(measure).catch(() => {});
      const raf = requestAnimationFrame(measure);
      return () => {
        ro.disconnect();
        cancelAnimationFrame(raf);
      };
    }, [children, className]);

    return (
      <div
        ref={wrapRef}
        // expose CSS vars on the wrapper so children can read them
        style={{
          ...S.parent,
          // allow per-instance overrides (custom preset, tint, etc.)
          ["--TextVibrancySettings" as any]: filterString || undefined,
          ["--TextVibrancyTint" as any]: tint || "rgba(255, 255, 255, 0.5)",
          ["--vtxt-w" as any]: "0px",
          ["--vtxt-h" as any]: "0px",
          ["--vtxt-ty" as any]: "0px",
          ...style,
        }}
        className={className}
        aria-label={children}
      >
        {/* clipPath text (mask) */}
        <svg style={S.svgHidden} width={0} height={0} aria-hidden>
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <text
                className={className}
                x={0}
                y={"var(--vtxt-ty)"}
                dominantBaseline="text-before-edge"
                alignmentBaseline="hanging"
                fill="currentColor"
              >
                {children}
              </text>
            </clipPath>
          </defs>
        </svg>

        {/* blurred/tinted backdrop clipped to glyphs */}
        <div
          style={{
            ...S.blur,
            clipPath: `url(#${clipId})`,
            WebkitClipPath: `url(#${clipId})`,
          }}
          aria-hidden
        />

        {/* transparent selectable text exactly sized to bbox */}
        <span ref={ref} style={S.readable} {...rest}>
          {children}
        </span>

        {/* hidden measuring text (must live in normal tree, not in <defs>) */}
        <svg style={S.measureSvg} width={0} height={0} aria-hidden>
          <text
            ref={measureTextRef}
            className={className}
            x={0}
            y={0}
            dominantBaseline="text-before-edge"
            alignmentBaseline="hanging"
            fill="currentColor"
          >
            {children}
          </text>
        </svg>
      </div>
    );
  }
);

VibrantText.displayName = "VibrantText";
