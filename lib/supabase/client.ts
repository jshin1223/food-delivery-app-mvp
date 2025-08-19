// lib/supabase/client.ts
"use client";

import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

export function supabaseBrowser() {
  return createBrowserSupabaseClient();
}

export const createSupabaseBrowserClient = supabaseBrowser;
