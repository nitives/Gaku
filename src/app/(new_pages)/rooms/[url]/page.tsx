"use client";
import { dev } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Rooms() {
  //   const [song, setSong] = useState<SoundCloudTrack | null>(null);
  const { url } = useParams() as {
    url: string;
  };

  return <div>{url}</div>;
}
