"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
// wyzly/app/layout.tsx
import "../app/globals.css"; // ← make sure this path is correct

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  return (
    <nav className="w-full px-6 py-3 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-wide hover:text-blue-200">
          Wyzly
        </Link>
        <div className="flex gap-6 text-lg">
          {!loggedIn ? (
            <Link href="/login" className="hover:text-blue-200 transition">Login</Link>
          ) : (
            <Link href="/logout" className="hover:text-blue-200 transition">Logout</Link>
          )}
          <Link href="/dashboard" className="hover:text-blue-200 transition">Restaurant Dashboard</Link>
          <Link href="/orders" className="hover:text-blue-200 transition">Admin Orders</Link>
        </div>
      </div>
    </nav>
  );
}
