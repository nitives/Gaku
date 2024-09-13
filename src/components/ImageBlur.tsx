import Image from "next/image";
import React from "react";

export const ImageBlur = ({
  src,
  children,
  className,
  blur,
  opacity = 1,
  animated = false,
}: {
  src: string;
  children: React.ReactNode;
  className?: string;
  blur?: string;
  opacity?: number;
  animated?: boolean;
}) => {
  const imageStyle = {
    filter: blur ? `blur(${blur}px)` : undefined,
    opacity: opacity,
    transition: "opacity 0.25s ease-in-out, filter 0.25s ease-in-out",
  };

  return (
    <div className={`relative ${className}`}>
      <Image
        style={imageStyle}
        className={`absolute inset-0 w-full h-full object-cover scale-150 filter ${
          animated ? "animate-pulse" : ""
        }`}
        src={src}
        alt="Blurred Background 1"
        layout="fill"
        draggable={false}
        unoptimized={true}
      />
      <Image
        style={imageStyle}
        className="absolute inset-0 w-full h-full object-cover scale-150 filter"
        src={src}
        alt="Blurred Background 2"
        layout="fill"
        draggable={false}
        unoptimized={true}
      />
      <Image
        style={{ ...imageStyle, opacity: 0.05 }}
        className={`absolute inset-0 w-full h-full object-cover scale-150 opacity-0 filter ${
          animated ? "animate-ping" : ""
        }`}
        src={src}
        alt="Blurred Background 3"
        layout="fill"
        draggable={false}
        unoptimized={true}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
