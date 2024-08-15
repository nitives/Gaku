import React from "react";
import ReactPlayer from "react-player";

interface AnimatedCoverProps {
  hlsUrl: string;
}

export const AnimatedCover: React.FC<AnimatedCoverProps> = ({ hlsUrl }) => {
  return (
    <>
      <ReactPlayer
        url={hlsUrl}
        playing
        loop
        muted
        width="100%"
        height="100%"
        controls={false}
        style={{ borderRadius: "16px", aspectRatio: "1/1" }}
      />
    </>
  );
};

export default AnimatedCover;
