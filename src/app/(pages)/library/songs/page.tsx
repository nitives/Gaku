import LibrarySongs from "@/components/main/library/LibraryPage";
import { conf } from "@/lib/config";
import { Metadata } from "next";

const config = conf();
export const metadata: Metadata = {
  title: `Library | ${config.APP_NAME}`,
};

export default async function LibrarySongsPage() {
  return <LibrarySongs />;
}
