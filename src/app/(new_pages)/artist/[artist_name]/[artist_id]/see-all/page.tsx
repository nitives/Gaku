"use client";
import { dev } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface SeeAllPageProps {
  params: {
    artist_name: string;
    artist_id: string;
  };
}

export default function SeeAllPage({ params }: SeeAllPageProps) {
  const searchParams = useSearchParams();
  const section = searchParams?.get("section");
  dev.log("params", params);

  return (
    <div>
      <h2>{/* Artist: {params.artist_name} (ID: {params.artist_id}) */}</h2>
      {/* <p>Section requested: {section}</p> */}
      {/* ...render "full-albums", "singles", "top-songs", etc. based on section... */}
    </div>
  );
}
