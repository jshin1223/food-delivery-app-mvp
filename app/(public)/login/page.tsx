"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      alert("Login succeeded but no user found.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("roles")
      .eq("id", userId)
      .single();

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    const roles: string[] = profile?.roles || [];
    if (roles.includes("admin")) {
      router.push("/orders");
    } else if (roles.includes("restaurant")) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-200 flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-6 text-center">Log In</h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-blue-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-blue-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
          >
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>
        <div className="mt-6 flex flex-col items-center gap-2">
          <Link href="/forgot-password" className="text-blue-500 hover:underline text-sm">Forgot Password?</Link>
          <div className="text-sm mt-2">
            New here?{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
