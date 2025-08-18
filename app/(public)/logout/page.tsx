"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  // Logout user when page loads
  useEffect(() => {
    (async () => {
      await supabase.auth.signOut();
      router.replace("/login");
    })();
  }, [router, supabase]);

  return (
    <main className="max-w-md mx-auto mt-10 bg-white shadow rounded p-6 flex items-center justify-center">
      <span className="text-lg text-gray-600">Signing you out…</span>
    </main>
  );
}
