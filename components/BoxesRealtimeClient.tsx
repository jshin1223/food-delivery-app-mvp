"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function BoxesRealtimeClient() {
  useEffect(() => {
    const supabase = supabaseBrowser();
    const channel = supabase.channel("realtime:boxes")
      .on("postgres_changes", { event: "*", schema: "public", table: "boxes" }, () => {
        // naive: full reload. Better: mutate SWR/React Query cache.
        window.location.reload();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
