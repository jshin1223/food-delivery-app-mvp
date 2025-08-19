// lib/supabase/server.ts
import { cookies } from "next/headers";
import {
  createServerComponentClient,
  createServerActionClient,
} from "@supabase/auth-helpers-nextjs";

export function supabaseServerRSC() {
  // Use inside Server Components (read-only cookies)
  return createServerComponentClient({ cookies });
}

export function supabaseServer() {
  // Use inside Server Actions / Route Handlers (writable cookies)
  return createServerActionClient({ cookies });
}
