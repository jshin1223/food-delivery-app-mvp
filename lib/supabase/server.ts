// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/** Use in Server Components (RSC): cookies are read-only */
export async function supabaseServerRSC() {
  const cookieStore = await cookies(); // ✅ Next.js 15: await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // no-ops in RSC to avoid "read-only" errors
        set(_n: string, _v: string, _o: CookieOptions) {},
        remove(_n: string, _o: CookieOptions) {},
      },
    }
  );
}

/** Use in Server Actions / Route Handlers: cookies are writable */
export async function supabaseServer() {
  const cookieStore = await cookies(); // ✅ await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options }); // ✅ writable
        },
        remove(name: string, _options: CookieOptions) {
          cookieStore.delete(name); // ✅ use delete instead of blank set
        },
      },
    }
  );
}
