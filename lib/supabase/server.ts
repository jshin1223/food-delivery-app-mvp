import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Use in SERVER COMPONENTS (RSC) – read-only cookies
export async function createServerClientRSC() {
  const cookieStore = await cookies(); // <-- await on Next 15
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // no-ops in RSC
        set() {},
        remove() {},
      },
    }
  );
}

// Use in ROUTE HANDLERS / SERVER ACTIONS – can mutate cookies
export async function createServerClientForRoute() {
  const cookieStore = await cookies(); // <-- await on Next 15
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}
