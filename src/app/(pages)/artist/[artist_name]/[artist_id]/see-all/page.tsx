"use client";
import { Banner } from "@/components/main/artist/banner/Banner";
import { Spinner } from "@/components/extra/Spinner";
import { SoundCloudArtist, SoundCloudTrack } from "@/lib/types/soundcloud";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { TryAgain } from "@/components/extra/TryAgain";
import { useAudioStore } from "@/context/AudioContext";
import { useUser } from "@/hooks/useUser";
import { LikeFilledIcon } from "@/components/player/new/PlayerBar";
import ContextMenu from "@/components/contextmenus/ContextMenu";
import { Song } from "@/lib/audio/types";

const soundCloudOfficial = ["music-charts-us"];

// Fetch artist data with all tracks
async function fetchArtistAllTracks(artistId: string, _artistName: string) {
  const data = (await SoundCloudKit.getData(artistId, "artist", {
    include: ["allTracks"],
  })) as SoundCloudArtist & { allTracks: SoundCloudTrack[] };
  return data;
}

// Convert SoundCloud track to Song format
const convertTrackToSong = (track: SoundCloudTrack): Song => {
  return {
    albumName: track.publisher_metadata
      ? track.publisher_metadata.album_title || ""
      : "",
    artist: {
      id: track.user?.id || -1,
      name: track.user?.username || "",
      url: `/artist/${track.user?.permalink}/${track.user?.id}`,
      soundcloudURL: track.user?.permalink_url || "",
      permalink: track.user?.permalink || "",
      verified: false,
      followers: 0,
      city: "",
      avatar: track.user?.avatar_url || "",
    },
    metadata: {
      artistName: track.publisher_metadata?.artist || "",
      albumTitle: track.publisher_metadata?.album_title || "",
      isrc: track.publisher_metadata?.isrc || "",
    },
    artwork: {
      hdUrl: track.artwork_url
        ? track.artwork_url.replace("-large", "-t500x500")
        : "",
      url: track.artwork_url || "",
    },
    id: track.id,
    songHref: track.permalink_url,
    name: track.title,
    explicit: track.publisher_metadata?.explicit || false,
    src: "", // M3U8 will be fetched by the player
  };
};

export default function SeeAllPage() {
  const { artist_name, artist_id } = useParams() as {
    artist_name: string;
    artist_id: string;
  };

  const {
    data: artistData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["soundcloudArtistAllTracks", artist_id],
    queryFn: () => fetchArtistAllTracks(artist_id, artist_name),
    enabled: !!artist_id,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (soundCloudOfficial.includes(artist_name)) {
    return (
      <p className="text-[--systemSecondary]">
        This type of artist page is unavailable
      </p>
    );
  }

  console.log("Artist Data:", artistData);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <TryAgain
        errorName={(error as Error).name}
        errorMessage={(error as Error).message}
        onTryAgain={() => refetch()}
      />
    );
  }

  if (!artistData) {
    return <p className="text-[--systemSecondary]">No artist found.</p>;
  }

  return (
    <div className="pb-20">
      <Banner artist={artistData} />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">All Tracks</h1>
        <TrackList tracks={artistData.allTracks || []} artist={artistData} />
      </div>
    </div>
  );
}

const TrackList = ({
  tracks,
  artist,
}: {
  tracks: SoundCloudTrack[];
  artist: SoundCloudArtist;
}) => {
  const { setQueue } = useAudioStore();
  const { librarySongs } = useUser();
  const { currentSong } = useAudioStore();

  const handlePlayFromIndex = async (index: number) => {
    try {
      // Create a queue starting from the clicked song
      const tracksFromIndex = tracks.slice(index);
      const songsToPlay = tracksFromIndex.map((track) =>
        convertTrackToSong(track)
      );

      // Set the queue with these songs
      await setQueue(songsToPlay);
    } catch (error) {
      console.error("Failed to play song from list:", error);
    }
  };

  if (!tracks || tracks.length === 0) {
    return (
      <p className="text-[--systemSecondary] text-center my-8">
        No tracks found for this artist.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tracks.map((track, index) => (
        <ContextMenu
          key={track.id}
          title={track.title}
          className="flex items-center p-3 hover:bg-[--systemSecondary]/10 rounded-md transition-colors"
          as={"div"}
          type="song"
          itemId={String(track.id)}
        >
          <div
            onClick={() => handlePlayFromIndex(index)}
            className="w-8 text-center mr-4"
            style={{
              color:
                currentSong?.id === track.id
                  ? "var(--keyColor)"
                  : "var(--systemSecondary)",
            }}
          >
            {index + 1}
          </div>
          <div
            className="flex-1 overflow-hidden"
            onClick={() => handlePlayFromIndex(index)}
          >
            <h3 className="text-base font-medium truncate">{track.title}</h3>
            <p className="text-sm text-[--systemSecondary] truncate">
              {formatDate(track.created_at || track.display_date)}
            </p>
          </div>
          <div className="pr-2">
            {librarySongs?.some(
              (librarySong) => librarySong?.id === String(track.id)
            ) ? (
              <LikeFilledIcon />
            ) : null}
          </div>
        </ContextMenu>
      ))}
    </div>
  );
};

function formatDate(dateString: string | number | Date) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
