import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = async () => {
  const { getToken } = await auth();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !url) {
    throw new Error("No Supabase Key or URL found");
  }
  return createClient(url, key, {
    global: {
      fetch: async (url: any, options: any) => {
        const token = await getToken({ template: "supabase" });
        const headers = new Headers(options?.headers);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(url, { ...options, headers });
      },
    },
  });
};

export default supabase;
