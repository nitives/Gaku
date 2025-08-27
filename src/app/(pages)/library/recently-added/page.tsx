import { RecentlyAdded } from "@/components/main/library/recently-added/RecentlyAdded";
import { conf } from "@/lib/config";
import { Metadata } from "next";

const config = conf();
export const metadata: Metadata = {
  title: `Library | ${config.APP_NAME}`,
};

export default async function LibraryRecentlyAddedPage() {
  return <RecentlyAdded />;
}
