import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  // Make sure these env vars exist in .env.local
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
