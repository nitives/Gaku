"use client";
import { useParams } from "next/navigation";

export default function Rooms() {
  //   const [song, setSong] = useState<SoundCloudTrack | null>(null);
  const { url } = useParams() as {
    url: string;
  };

  return <div>{url}</div>;
}
