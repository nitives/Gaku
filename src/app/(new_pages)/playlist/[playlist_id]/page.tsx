interface PlaylistPageProps {
  params: {
    id: string;
  };
}

export default function PlaylistPage({ params }: PlaylistPageProps) {
  return (
    <div>
      <h2>Playlist ID: {params.id}</h2>
      {/* Your playlist detail content goes here */}
    </div>
  );
}
