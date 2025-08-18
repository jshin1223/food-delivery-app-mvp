"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { seedProfile } from "../actions"; // You already have this

export default function SignUpPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupAs, setSignupAs] = useState<"customer" | "restaurant" | "admin">("customer");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, requested_role: signupAs },
        },
      });

      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) {
        setMessage("Sign-up successful! Please check your email for a confirmation link before logging in.");
        setSuccess(true);
        setLoading(false);
        return;
      }

      // Insert profile securely; backend should use "roles" column
      await seedProfile({ userId, fullName, requestedRole: signupAs });

      setSuccess(true);
      setMessage("Sign-up successful! Please check your email for a confirmation link before logging in.");

      // Redirect to login after 3 seconds
      setTimeout(() => router.push("/public/login"), 3000);
    } catch (err: any) {
      setMessage(err?.message ?? "Sign-up failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          {["customer", "restaurant", "admin"].map((role) => (
            <label key={role} className="flex items-center gap-2 capitalize">
              <input
                type="radio"
                name="role"
                value={role}
                checked={signupAs === role}
                onChange={() => setSignupAs(role as typeof signupAs)}
              />
              {role}
            </label>
          ))}
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
          <a className="text-blue-600 hover:underline" href="/public/login">
            Log in
          </a>
        </p>
      </form>

      {(message || success) && (
        <div className={`mt-6 p-4 rounded shadow border text-center
          ${success ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'}`}>
          {message}
        </div>
      )}
    </main>
  );
}
