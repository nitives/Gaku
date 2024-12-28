interface LibrarySongsPageProps {
  params: {
    id: string;
  };
}

export default function LibrarySongs({ params }: LibrarySongsPageProps) {
  return (
    <div>
      <h2>LibrarySongs ID: {params.id}</h2>
      {/* Your playlist detail content goes here */}
    </div>
  );
}
