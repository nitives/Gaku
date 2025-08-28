import { useEffect, useMemo, useRef } from "react";
import Artwork from "./Artwork";
import style from "./styles/PlayerBar.module.css";
import { useAudioStore } from "@/context/AudioContext";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { useUser } from "@/hooks/useUser";
import { dev } from "@/lib/utils";
import { formatTime, VolumeSlider } from "@/components/controls/Controls";
import { PrefetchLink } from "../../navigation/PrefetchLink";
import { FullScreen } from "../FullScreenButton";
import { Song } from "@/lib/audio/types";
import { LoopIcon, LoopSingleIcon } from "@/components/icons/Loop";

export const PlayerBar = () => {
  const { currentSong, volume, setVolume } = useAudioStore();
  const setFullscreen = useAudioStore((state: any) => state.setFullscreen);
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
          <TrackInfo name={currentSong?.name} artist={currentSong?.artist} />
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

const TrackInfo = ({
  name,
  artist,
}: {
  name?: string;
  artist?: Song["artist"];
}) => {
  return (
    <div className={style.trackInfo}>
      <h3 className={style.trackTitle}>{name || "Not playing"}</h3>
      <PrefetchLink
        href={`/artist/${artist?.permalink}/${artist?.id}`}
        className={style.trackArtist}
      >
        {artist?.name || "Unknown Artist"}
      </PrefetchLink>
    </div>
  );
};

const LikeButton = ({ song }: { song: any }) => {
  const { addSongToLibrary, removeSongFromLibrary, librarySongs } = useUser();
  const songID = String(song?.id);

  // Check if currentSong is in the user’s library
  const isInLibrary =
    librarySongs?.some((librarySong: any) => librarySong?.id == songID) || false;

  // Handler to toggle add/remove from library
  const handleLikeToggle = () => {
    if (!songID || songID === "undefined" || songID === "null") {
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
  const setFullscreen = useAudioStore((state: any) => state.setFullscreen);
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
  const currentTime = useAudioStore((state: any) => state.currentTime ?? 0);
  const duration = useAudioStore((state: any) => state.duration ?? 0);
  const seek = useAudioStore((state: any) => state.seek);
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
        className="gaku-slider seek-slider"
      />
    </div>
  );
};

const Buttons = () => {
  const shuffle = useAudioStore((s: any) => s.shuffle);
  const setShuffle = useAudioStore((s: any) => s.setShuffle);
  const repeat = useAudioStore((s: any) => s.repeat);
  const setRepeat = useAudioStore((s: any) => s.setRepeat);

  const onToggleShuffle = () => setShuffle(!shuffle);
  const onCycleRepeat = () =>
    setRepeat(repeat === "off" ? "all" : repeat === "all" ? "one" : "off");

  return (
    <div className={style.buttons}>
      <button
        title={`Shuffle: ${shuffle ? "On" : "Off"}`}
        className={style.shuffleButton}
        onClick={onToggleShuffle}
      >
        <ShuffleIcon
          className={style.shuffleIcon}
          fill="white"
          size={16}
          opacity={shuffle ? 1 : 0.5}
        />
      </button>
      <PlayPauseButtons />
      <button
        title={`Loop mode: ${repeat}`}
        className={style.loopButton}
        onClick={onCycleRepeat}
      >
        {repeat === "all" ? (
          <LoopIcon
            className={style.loopIcon}
            fill="white"
            size={16}
            opacity={1}
          />
        ) : repeat === "one" ? (
          <LoopSingleIcon
            className={style.loopIcon}
            fill="white"
            size={16}
            opacity={1}
          />
        ) : (
          <LoopIcon
            className={style.loopIcon}
            fill="white"
            size={16}
            opacity={0.5}
          />
        )}
      </button>
    </div>
  );
};

const PlayPauseButtons = () => {
  const { isPlaying, setIsPlaying, nextSong, previousSong } = useAudioStore(
    (state: any) => state
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
