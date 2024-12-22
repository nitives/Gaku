import React, { useEffect, useRef, useState } from "react";

interface CanvasBackgroundProps {
  src: string;
  blur?: number;
  warpIntensity?: number;
  imgScale?: number;
  maxFramerate?: number;
  bpm?: number;
  brightness?: number;
  transitionDuration?: number; // Add transitionDuration prop
  className?: string;
  children: React.ReactNode;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
  src,
  blur = 10,
  warpIntensity = 20,
  imgScale = 2,
  maxFramerate = 40,
  bpm = 60,
  brightness = 1,
  transitionDuration = 200, // Default transition duration in milliseconds
  className,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [rotationDirection, setRotationDirection] = useState(1);
  const [pulseValue, setPulseValue] = useState(0);
  const [speed, setSpeed] = useState(bpm / 120);
  const [currentBrightness, setCurrentBrightness] = useState(brightness);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => setImage(img);
  }, [src]);

  useEffect(() => {
    setSpeed(bpm / 120);
  }, [bpm]);

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 250;
    canvas.height = 250;

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Apply warp effect
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          const warpX = x + Math.sin(y / warpIntensity) * warpIntensity;
          const warpY = y + Math.cos(x / warpIntensity) * warpIntensity;
          const warpIndex =
            (Math.floor(warpY) * canvas.width + Math.floor(warpX)) * 4;

          if (warpIndex >= 0 && warpIndex < data.length) {
            data[index] = data[warpIndex];
            data[index + 1] = data[warpIndex + 1];
            data[index + 2] = data[warpIndex + 2];
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // Smoothly transition brightness
      setCurrentBrightness((prev) => {
        const step = (brightness - prev) * (1 / (transitionDuration / 16.67));
        return prev + step;
      });

      // Apply blur and brightness effect
      ctx.filter = `blur(${blur}px) brightness(${currentBrightness})`;
      ctx.drawImage(canvas, 0, 0);

      // Update rotation
      setRotation((prev) => prev + 0.01 * rotationDirection * speed);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    image,
    blur,
    warpIntensity,
    rotationDirection,
    speed,
    brightness,
    currentBrightness,
    transitionDuration,
  ]);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: "100%", height: "100%" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 blur-[10px]"
        style={{
          transform: "translate(-50%, -50%) scaleX(8) scaleY(4.5)",
          top: "50%",
          left: "50%",
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
