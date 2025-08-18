"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupAs, setSignupAs] = useState<"customer" | "restaurant">("customer");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      alert("Sign-up created, but no user ID yet. Check your email confirmation settings.");
      setLoading(false);
      return;
    }

    // Build roles array
    const roles = signupAs === "restaurant" ? ["customer", "restaurant"] : ["customer"];

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      roles,
    });

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    // Go to login after successful signup
    router.push("/login");
  };

  return (
    <main className="max-w-md mx-auto mt-10 bg-white shadow rounded p-6">
      <h1 className="text-2xl font-bold mb-4">Create your account</h1>

      <form onSubmit={handleSignUp} className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          className="w-full border px-3 py-2 rounded"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="space-y-2">
          <div className="font-medium">Sign up as</div>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="customer"
              checked={signupAs === "customer"}
              onChange={() => setSignupAs("customer")}
            />
            Customer
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="restaurant"
              checked={signupAs === "restaurant"}
              onChange={() => setSignupAs("restaurant")}
            />
            Restaurant (vendor)
          </label>
          <p className="text-sm text-gray-600">
            Admins are assigned manually by Wyzly staff (not selectable here).
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <a className="text-blue-600 hover:underline" href="/login">
            Log in
          </a>
        </p>
      </form>
    </main>
  );
}
