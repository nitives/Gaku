interface LibraryAlbumsPageProps {
  params: {
    id: string;
  };
}

export default function LibraryAlbums({ params }: LibraryAlbumsPageProps) {
  return (
    <div>
      <h2>LibraryAlbums ID: {params.id}</h2>
      <p>Library Albums isn&apos;t finished yet</p>
      {/* Your playlist detail content goes here */}
    </div>
  );
}
