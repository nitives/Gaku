interface AlbumPageProps {
  params: {
    id: string;
  };
}

export default function Album({ params }: AlbumPageProps) {
  return (
    <div>
      <h2>Album ID: {params.id}</h2>
      {/* Your playlist detail content goes here */}
    </div>
  );
}
