import { LibraryAlbums } from "@/rework/components/main/library/albums/LibraryAlbums";
import { conf } from "@/lib/config";
import { Metadata } from "next";

const config = conf();
export const metadata: Metadata = {
  title: `Library | ${config.APP_NAME}`,
};

export default async function LibraryAlbumsPage() {
  return <LibraryAlbums />;
}
