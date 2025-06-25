import React, { SVGAttributes, useEffect, useMemo, useRef } from "react";
import Artwork from "./Artwork";
import style from "./styles/PlayerBar.module.css";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { useUser } from "@/hooks/useUser";
import { dev } from "@/lib/utils";
import {
  formatTime,
  VolumeSlider,
} from "@/components/player/new/controls/Controls";
import { PrefetchLink } from "../../navigation/PrefetchLink";
import { FullScreen } from "../FullScreenButton";

export const PlayerBar = () => {
  const { currentSong, volume, setVolume } = useAudioStoreNew();
  const setFullscreen = useAudioStoreNew((state) => state.setFullscreen);
  const ArtworkSRC = SoundCloudKit.getHD(currentSong?.artwork.url || "");
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };
  return (
    <div className={style.playerBarContainer}>
      <div className={style.playerBar}>
        <div className={style.info}>
          <Artwork
            onClick={() => setFullscreen(true)}
            artworkUrl={ArtworkSRC}
            altText={currentSong?.name || "Artwork"}
          />
          <TrackInfo song={currentSong} />
          <LikeButton song={currentSong} />
        </div>
        <div className={style.controls}>
          <DurationBar />
          <Buttons />
        </div>
        <div className={style.volumeNImmersive}>
          <VolumeSlider
            animated={false}
            onChange={handleVolumeChange}
            volume={volume}
          />
          <ImmersiveButton />
        </div>
      </div>
      <FullScreen.Screen />
    </div>
  );
};

// Track Info

const TrackInfo = ({ song }: any) => {
  return (
    <div className={style.trackInfo}>
      <h3 className={style.trackTitle}>{song?.name || "Not playing"}</h3>
      <PrefetchLink
        href={`/artist/${song?.artist?.permalink}/${song?.artist?.id}`}
        className={style.trackArtist}
      >
        {song?.artist?.name || "Unknown Artist"}
      </PrefetchLink>
    </div>
  );
};

const LikeButton = ({ song }: { song: any }) => {
  const { addSongToLibrary, removeSongFromLibrary, librarySongs } = useUser();
  const songID = String(song?.id);

  // Check if currentSong is in the user’s library
  const isInLibrary =
    librarySongs?.some((librarySong) => librarySong?.id == songID) || false;

  // Handler to toggle add/remove from library
  const handleLikeToggle = () => {
    if (songID == "undefined" || undefined) {
      dev.error("No valid song ID found.");
      console.error("No valid song ID found.");
      return;
    } // Guard if no valid song or ID
    if (isInLibrary) {
      removeSongFromLibrary(songID);
    } else {
      addSongToLibrary(songID);
    }
  };

  return (
    <button
      className={style.likeButton}
      onClick={handleLikeToggle}
      aria-label={
        isInLibrary ? "Remove song from library" : "Add song to library"
      }
      title={isInLibrary ? "Remove song from library" : "Add song to library"}
    >
      {isInLibrary ? <LikeFilledIcon /> : <LikeOutlineIcon />}
    </button>
  );
};

export const LikeFilledIcon = () => (
  <svg
    width="12"
    height="11"
    viewBox="0 0 12 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 10.75C6.15146 10.75 6.37246 10.6411 6.55443 10.5348C9.87085 8.51398 12 6.14585 12 3.74752C12 1.68262 10.4914 0.25 8.59842 0.25C7.41977 0.25 6.53415 0.865327 6 1.78748C5.47563 0.86993 4.57915 0.25 3.4016 0.25C1.50864 0.25 0 1.68262 0 3.74752C0 6.14585 2.12914 8.51398 5.45044 10.5348C5.62754 10.6411 5.84748 10.75 6 10.75Z"
      fill="var(--keyColor)"
    />
  </svg>
);

const LikeOutlineIcon = () => (
  <svg
    width="12"
    height="11"
    viewBox="0 0 12 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 4.08097C0 6.36509 2.12914 8.62046 5.45044 10.545C5.62754 10.6463 5.84748 10.75 6 10.75C6.15146 10.75 6.37246 10.6463 6.55443 10.545C9.87085 8.62046 12 6.36509 12 4.08097C12 2.1144 10.4914 0.75 8.5486 0.75C7.41977 0.75 6.53415 1.21756 6 1.92195C5.47563 1.22195 4.57915 0.75 3.45138 0.75C1.50864 0.75 0 2.1144 0 4.08097ZM1.19583 4.07616C1.19583 2.71956 2.18651 1.80893 3.51541 1.80893C4.5883 1.80893 5.19345 2.39399 5.56616 2.90453C5.72973 3.1203 5.84353 3.18969 6 3.18969C6.15647 3.18969 6.25734 3.11495 6.43171 2.90453C6.83407 2.4018 7.41658 1.80893 8.48458 1.80893C9.81347 1.80893 10.8031 2.71956 10.8031 4.07616C10.8031 5.96867 8.61196 8.05852 6.11405 9.55432C6.06108 9.5879 6.02377 9.61171 6 9.61171C5.97623 9.61171 5.93892 9.5879 5.89082 9.55432C3.38699 8.05852 1.19583 5.96867 1.19583 4.07616Z"
      fill="#1D1D1D"
    />
  </svg>
);

// Controls

const ImmersiveButton = () => {
  const setFullscreen = useAudioStoreNew((state) => state.setFullscreen);
  return (
    <button
      className={style.immersiveButton}
      onClick={() => setFullscreen(true)}
      aria-label="Immersive Mode"
    >
      <ImmersiveIcon fill="white" size={16} className={style.icon} />
    </button>
  );
};

const DurationBar = () => {
  const currentTime = useAudioStoreNew((state) => state.currentTime ?? 0);
  const duration = useAudioStoreNew((state) => state.duration ?? 0);
  const seek = useAudioStoreNew((state) => state.seek);
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  return (
    <div className={style.durationBar}>
      <span className={style.timeCode}>{formatTime(currentTime)}</span>
      <div className={style.progressBar}>
        <DurationSlider
          onChange={handleSeekChange}
          duration={duration}
          currentTime={currentTime}
        />
      </div>
      <span className={style.timeCode}>{formatTime(duration)}</span>
    </div>
  );
};

const DurationSlider = ({
  duration,
  currentTime,
  onChange,
}: {
  duration: number;
  currentTime: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const sliderRef = useRef<HTMLInputElement>(null);

  // Calculate seek percentage only when needed
  const seekPercentage = useMemo(() => {
    return (currentTime / (duration || 1)) * 100 || 0;
  }, [currentTime, duration]);

  // Update the slider position using transform instead of CSS variables
  useEffect(() => {
    if (sliderRef.current) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        if (sliderRef.current) {
          sliderRef.current.style.setProperty(
            "--seek-value",
            `${seekPercentage}%`
          );
        }
      });
    }
  }, [seekPercentage]);

  return (
    <div className="flex items-center gap-2 w-full">
      <input
        ref={sliderRef}
        type="range"
        min={0}
        max={duration || 1}
        value={currentTime}
        onChange={onChange}
        className="apple-slider seek-slider"
      />
    </div>
  );
};

const Buttons = () => {
  return (
    <div className={style.buttons}>
      <button className={style.shuffleButton}>
        <ShuffleIcon
          className={style.shuffleIcon}
          fill="white"
          size={16}
          opacity={0.5}
        />
      </button>
      <PlayPauseButtons />
      <button className={style.loopButton}>
        <LoopIcon
          className={style.loopIcon}
          fill="white"
          size={16}
          opacity={0.5}
        />
      </button>
    </div>
  );
};

const PlayPauseButtons = () => {
  // const { currentSong, nextSong, previousSong } = useAudioStoreNew();
  const { isPlaying, setIsPlaying, nextSong, previousSong } = useAudioStoreNew(
    (state) => state
  );
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={style.playPauseSkipButtons}>
      <button onClick={previousSong} className={style.backwardsButton}>
        <BackwardsIcon height={14} fill={"white"} className={style.icon} />
      </button>
      <button
        className={style.playPauseButton}
        onClick={handlePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <PauseIcon fill={"white"} className={style.icon} />
        ) : (
          <PlayIcon fill={"white"} className={style.icon} />
        )}
      </button>
      <button onClick={nextSong} className={style.forwardsButton}>
        <ForwardsIcon height={14} fill={"white"} className={style.icon} />
      </button>
    </div>
  );
};

// Icons

const PauseIcon = ({
  className,
  fill,
  size,
  width,
  height,
}: {
  className: string;
  fill: string;
  size?: number;
  width?: number;
  height?: number;
}) => (
  <svg
    className={className}
    width={size || width || "16"}
    height={size || height || "20"}
    viewBox="0 0 16 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.05416 20H4.87962C6.0095 20 6.59805 19.4115 6.59805 18.2717V1.71844C6.59805 0.559889 6.0095 0.00866892 4.87962 0H2.05416C0.924262 0 0.333549 0.588546 0.333549 1.71844V18.2717C0.327048 19.4115 0.915593 20 2.05416 20ZM11.1674 20H13.983C15.1228 20 15.7036 19.4115 15.7036 18.2717V1.71844C15.7036 0.559889 15.1228 0 13.983 0H11.1674C10.0277 0 9.437 0.588546 9.437 1.71844V18.2717C9.437 19.4115 10.0212 20 11.1674 20Z"
      fill={fill}
    />
  </svg>
);

const PlayIcon = ({
  className,
  fill,
  size,
  width,
  height,
}: {
  className: string;
  fill: string;
  size?: number;
  width?: number;
  height?: number;
}) => (
  <svg
    width={size || width || "19"}
    height={size || height || "21"}
    className={className}
    viewBox="0 0 19 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.61718 20.5045C2.11335 20.5045 2.54554 20.3191 3.07756 20.0137L16.8872 12.0246C17.8957 11.4293 18.3094 10.9826 18.3094 10.2581C18.3094 9.53366 17.8957 9.08695 16.8872 8.50335L3.07756 0.504608C2.54554 0.197109 2.11335 0.0234375 1.61718 0.0234375C0.66562 0.0234375 0 0.745075 0 1.90171V18.6166C0 19.7733 0.66562 20.5045 1.61718 20.5045Z"
      fill={fill}
    />
  </svg>
);

const BackwardsIcon = ({
  className,
  fill,
  size,
  width,
  height,
}: {
  className: string;
  fill: string;
  size?: number;
  width?: number;
  height?: number;
}) => (
  <svg
    width={size || width || "34"}
    height={size || height || "19"}
    className={className}
    viewBox="0 0 34 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.7743 18.8299C15.7896 18.8299 16.6516 18.053 16.6516 16.6425V2.18741C16.6516 0.774841 15.7959 0 14.7785 0C14.2622 0 13.8291 0.152344 13.3191 0.450468L1.31859 7.50281C0.431715 8.02453 0 8.62828 0 9.40593C0 10.1911 0.438043 10.8096 1.31859 11.3271L13.3191 18.3794C13.8173 18.6776 14.258 18.8299 14.7743 18.8299ZM31.3673 18.8299C32.3847 18.8299 33.2446 18.053 33.2446 16.6425V2.18741C33.2446 0.774841 32.3889 0 31.3736 0C30.8552 0 30.4242 0.152344 29.9121 0.450468L17.9116 7.50281C17.0247 8.02453 16.593 8.62828 16.593 9.40593C16.593 10.1911 17.0332 10.8096 17.9116 11.3271L29.9121 18.3794C30.4104 18.6776 30.8531 18.8299 31.3673 18.8299Z"
      fill={fill}
    />
  </svg>
);

const ForwardsIcon = ({
  className,
  fill,
  size,
  width,
  height,
}: {
  className: string;
  fill: string;
  size?: number;
  width?: number;
  height?: number;
}) => (
  <svg
    width={size || width || "34"}
    height={size || height || "19"}
    className={className}
    viewBox="0 0 34 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.87734 18.8299C2.39366 18.8299 2.83429 18.6776 3.33257 18.3794L15.3351 11.3271C16.2136 10.8096 16.6633 10.1911 16.6633 9.40593C16.6633 8.62828 16.222 8.02453 15.3351 7.50281L3.33257 0.450468C2.82257 0.152344 2.39155 0 1.87312 0C0.857809 0 0 0.774841 0 2.18741V16.6425C0 18.053 0.862028 18.8299 1.87734 18.8299ZM18.4725 18.8299C18.9867 18.8299 19.4294 18.6776 19.9277 18.3794L31.9378 11.3271C32.8066 10.8096 33.2564 10.1911 33.2564 9.40593C33.2564 8.62828 32.815 8.02453 31.9378 7.50281L19.9277 0.450468C19.4273 0.152344 18.9846 0 18.4661 0C17.4508 0 16.5951 0.774841 16.5951 2.18741V16.6425C16.5951 18.053 17.4551 18.8299 18.4725 18.8299Z"
      fill={fill}
    />
  </svg>
);

const ShuffleIcon = ({
  className,
  fill,
  size,
  width,
  height,
  opacity,
}: {
  className: string;
  fill: string;
  size?: number;
  width?: number;
  height?: number;
  opacity?: number;
}) => (
  <svg
    width={size || width || "15"}
    height={size || height || "12"}
    className={className}
    viewBox="0 0 15 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.686035 9.09327C0.686035 9.43479 0.946127 9.67569 1.31277 9.67569H2.69012C3.69673 9.67569 4.28724 9.38018 4.98055 8.56391L8.58377 4.28757C9.09303 3.68358 9.50446 3.46779 10.185 3.46779H11.3615V4.76064C11.3615 5.04042 11.5259 5.20686 11.8084 5.20686C11.9408 5.20686 12.0579 5.15845 12.1553 5.07969L14.4539 3.16304C14.671 2.9843 14.67 2.6976 14.4539 2.50924L12.1553 0.588843C12.0579 0.511132 11.9408 0.467529 11.8084 0.467529C11.5259 0.467529 11.3615 0.629163 11.3615 0.908946V2.29709H10.1916C9.14954 2.29709 8.51201 2.58308 7.76445 3.47319L4.22618 7.68308C3.71947 8.2824 3.29927 8.51085 2.6498 8.51085H1.31277C0.950932 8.51085 0.686035 8.7517 0.686035 9.09327ZM0.686035 2.88432C0.686035 3.22106 0.950932 3.46779 1.31277 3.46779H2.61182C3.26716 3.46779 3.72428 3.69623 4.22618 4.29554L7.79926 8.54236C8.50991 9.38123 9.17695 9.67569 10.1884 9.67569H11.3615V11.0911C11.3615 11.3709 11.5259 11.5325 11.8084 11.5325C11.9408 11.5325 12.0579 11.4889 12.1553 11.4102L14.4539 9.49461C14.671 9.30997 14.67 9.02806 14.4539 8.83972L12.1553 6.92037C12.0579 6.84161 11.9408 6.7932 11.8084 6.7932C11.5259 6.7932 11.3615 6.95963 11.3615 7.23944V8.51085H10.2166C9.52872 8.51085 9.08038 8.28025 8.57847 7.68203L4.98055 3.40989C4.28724 2.59738 3.65981 2.30189 2.6532 2.30189H1.31277C0.946127 2.30189 0.686035 2.54276 0.686035 2.88432Z"
      fill={fill}
      fillOpacity={opacity || 1}
    />
  </svg>
);

const LoopIcon = ({
  className,
  fill,
  size,
  width,
  height,
  opacity,
}: {
  className: string;
  fill: string;
  size?: number;
  width?: number;
  height?: number;
  opacity?: number;
}) => (
  <svg
    width={size || width || "14"}
    height={size || height || "12"}
    className={className}
    fill="none"
    viewBox="0 0 14 12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.03309 6.27658C1.37017 6.27658 1.63439 6.01133 1.63439 5.67319V5.15142C1.63439 4.13641 2.32086 3.4866 3.39809 3.4866H7.9275V4.83906C7.9275 5.11873 8.09657 5.28406 8.37897 5.28406C8.50654 5.28406 8.62842 5.23672 8.72095 5.15798L11.0187 3.24208C11.2357 3.0634 11.2443 2.77681 11.0187 2.58853L8.72095 0.668874C8.62842 0.591193 8.50654 0.547607 8.37897 0.547607C8.09657 0.547607 7.9275 0.708124 7.9275 0.993657V2.31061H3.48972C1.62349 2.31061 0.429688 3.34589 0.429688 5.03472V5.67319C0.429688 6.01133 0.690147 6.27658 1.03309 6.27658ZM12.7113 5.71828C12.3684 5.71828 12.1089 5.97874 12.1089 6.32167V6.84343C12.1089 7.85845 11.4235 8.50238 10.3405 8.50238H5.81103V7.16222C5.81103 6.87673 5.64675 6.7162 5.36438 6.7162C5.23199 6.7162 5.11494 6.7587 5.01863 6.83743L2.71982 8.75334C2.50283 8.94271 2.49908 9.22446 2.71982 9.40692L5.01863 11.3266C5.11494 11.4053 5.23199 11.4526 5.36438 11.4526C5.64675 11.4526 5.81103 11.2873 5.81103 11.0076V9.68422H10.2488C12.1198 9.68422 13.3136 8.64791 13.3136 6.96011V6.32167C13.3136 5.97874 13.0484 5.71828 12.7113 5.71828Z"
      fill={fill}
      fillOpacity={opacity || 1}
    />
  </svg>
);

const LoopMultiIcon = ({
  className,
  fill,
  size,
  width,
  height,
  opacity,
}: {
  className: string;
  fill: string;
  size?: number;
  width?: number;
  height?: number;
  opacity?: number;
}) => (
  <svg
    width={size || width || "14"}
    height={size || height || "12"}
    className={className}
    viewBox="0 0 14 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.23529 6.33575C1.57029 6.33575 1.81474 6.0903 1.81474 5.75428V5.25148C1.81474 4.27335 2.47627 3.64715 3.51436 3.64715H6.51358V4.95047C6.51358 5.21998 6.67651 5.37929 6.9486 5.37929C7.07159 5.37929 7.18437 5.33368 7.27821 5.2578L9.49246 3.41151C9.70723 3.2347 9.70983 2.96315 9.49246 2.78171L7.27821 0.931802C7.18437 0.856943 7.07159 0.814941 6.9486 0.814941C6.67651 0.814941 6.51358 0.969626 6.51358 1.24478V2.51389H3.60265C1.80424 2.51389 0.653809 3.51155 0.653809 5.13903V5.75428C0.653809 6.08924 0.895659 6.33575 1.23529 6.33575ZM12.4892 5.79774C12.1495 5.79774 11.9087 6.03755 11.9087 6.37921V6.882C11.9087 7.86014 11.2482 8.48068 10.2045 8.48068H5.83962V7.18921C5.83962 6.91409 5.68132 6.7594 5.40921 6.7594C5.28162 6.7594 5.16883 6.80035 5.07601 6.87622L2.86073 8.72252C2.65163 8.905 2.64801 9.17656 2.86073 9.35235L5.07601 11.2023C5.16883 11.2781 5.28162 11.3238 5.40921 11.3238C5.68132 11.3238 5.83962 11.1644 5.83962 10.8949V9.61958H10.1162C11.9192 9.61958 13.0696 8.62092 13.0696 6.99444V6.37921C13.0696 6.03957 12.8242 5.79774 12.4892 5.79774Z"
      fill={fill}
      fillOpacity={opacity || 1}
    />
    <path
      d="M12.5049 4.628C12.8652 4.628 13.0892 4.41674 13.0892 4.03048V1.38141C13.0892 0.957431 12.8011 0.676514 12.3921 0.676514C12.0629 0.676514 11.8518 0.783664 11.5959 0.978545L10.8405 1.5493C10.6843 1.66966 10.6372 1.76959 10.6372 1.90993C10.6372 2.11994 10.7935 2.27113 11.0185 2.27113C11.1199 2.27113 11.2071 2.24346 11.2906 2.17425L11.8601 1.72182H11.9135V4.03048C11.9135 4.41674 12.1421 4.628 12.5049 4.628Z"
      fill={fill}
      fillOpacity={opacity || 1}
    />
  </svg>
);

const ImmersiveIcon = ({
  className,
  fill,
  size,
  width,
  height,
}: {
  className: string;
  fill: string;
  size?: number;
  width?: number;
  height?: number;
}) => (
  <svg
    width={size || width || "16"}
    height={size || height || "13"}
    className={className}
    viewBox="0 0 16 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.12621 10.4553H13.8738C14.9332 10.4553 15.5 9.89832 15.5 8.8436V2.10689C15.5 1.05695 14.9332 0.5 13.8738 0.5H2.12621C1.06681 0.5 0.5 1.05695 0.5 2.10689V8.8436C0.5 9.89832 1.06681 10.4553 2.12621 10.4553ZM2.19275 9.33742C1.81621 9.33742 1.62794 9.15505 1.62794 8.78244V2.17283C1.62794 1.79545 1.81621 1.61786 2.19275 1.61786H13.8062C14.1828 1.61786 14.371 1.79545 14.371 2.17283V8.78244C14.371 9.15505 14.1828 9.33742 13.8062 9.33742H2.19275ZM4.98231 12.5H11.0166C11.3101 12.5 11.5527 12.2601 11.5527 11.9708C11.5527 11.6814 11.3101 11.4404 11.0166 11.4404H4.98231C4.68988 11.4404 4.44723 11.6814 4.44723 11.9708C4.44723 12.2601 4.68988 12.5 4.98231 12.5Z"
      fill={fill}
    />
  </svg>
);
