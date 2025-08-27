import { LibraryArtists } from "@/components/main/library/artist/LibraryArtists";
import { conf } from "@/lib/config";
import { Metadata } from "next";

const config = conf();
export const metadata: Metadata = {
  title: `Library | ${config.APP_NAME}`,
};

export default async function LibraryArtistsPage() {
  return <LibraryArtists />;
}
