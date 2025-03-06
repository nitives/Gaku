interface PlaylistPageProps {
  params: {
    playlist_id: string;
  };
}

export default function PlaylistPage({ params }: PlaylistPageProps) {
  return (
    <div>
      <h2>Playlist ID: {params.playlist_id}</h2>
      <p>Playlist page isn&apos;t finished yet</p>
      {/* Your playlist detail content goes here */}
    </div>
  );
}
