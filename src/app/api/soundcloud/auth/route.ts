import { getSoundCloudCredentials } from "@/lib/config";
import { json } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const creds = await getSoundCloudCredentials();
  return json({ clientId: creds.clientId });
};
