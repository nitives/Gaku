import React from "react";
import ReactPlayer from "react-player";

interface AnimatedCoverProps {
  url: string;
  style?: React.CSSProperties;
}

export const AnimatedCover: React.FC<AnimatedCoverProps> = ({ url, style }) => {
  return (
    <>
      <ReactPlayer
        src={url}
        playing
        loop
        muted
        playsInline
        width="100%"
        height="100%"
        controls={false}
        style={{ borderRadius: "16px", aspectRatio: "1/1", ...style }}
      />
    </>
  );
};

export const AnimatedCoverFull: React.FC<AnimatedCoverProps> = ({ url }) => {
  return (
    <>
      <div>
        <div className="w-screen h-[19.5rem] bg-red-500/0" />
        <div className="-z-10 overflow-x-clip grid items-end justify-center w-screen h-[20rem] absolute top-0">
          <div className="scale-[1.2] absolute top-0 standalone:top-[-1rem] left-0 w-screen h-screen animated-video-container flex">
            <ReactPlayer
              src={url}
              playing={true}
              loop={true}
              muted={true}
              height={"25rem"}
              controls={false}
              playsInline={true}
              style={{ aspectRatio: "1/1" }}
            />
          </div>

          <div className="w-full h-56 album-animated-blur absolute translate-y-[14rem]" />
          <div className="w-full h-56 album-animated-fade bg-gradient-to-t from-[--apple-animated-bg-color] from-50% absolute translate-y-[14rem]" />
        </div>
      </div>
    </>
  );
};

export default AnimatedCover;
