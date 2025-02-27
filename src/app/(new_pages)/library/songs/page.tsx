"use client";
import { useUser } from "@/hooks/useUser";

export default function LibrarySongs() {
  const { librarySongs, isLoading, error, addSongToLibrary } = useUser();

  // if (isLoading) return <div>Loading...</div>;
  // if (error) return <div>Error: {(error as Error).message}</div>;

  const handleAddSong = () => {
    addSongToLibrary("1748428383"); // if we're being real - yeat | soundcloud id
  };
  
  return (
    <div>
      <h2>Library</h2>
      {librarySongs && librarySongs.length > 0 ? (
        <ul>
          {librarySongs.map((song: any) => (
            <li key={song.id}>{song.id}</li>
          ))}
        </ul>
      ) : (
        <div>Library is empty</div>
      )}
      <button onClick={handleAddSong}>Add Song</button>
    </div>
  );
}
