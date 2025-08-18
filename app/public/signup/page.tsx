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
  const [signupAs, setSignupAs] = useState<"customer" | "restaurant" | "admin">("customer");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    console.log("SIGNUP FORM SUBMITTED");
    e.preventDefault();
    setLoading(true);

    // Step 1: Create the user in Supabase Auth
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

    // Step 2: Log the exact values being sent to Supabase
    // This will appear in the browser's developer console to help debug issues
    console.log("INSERTING PROFILE", userId, fullName, signupAs);

    // Step 3: Insert the user profile into your database
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      role: signupAs,
    });

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    setSuccess(true); // Show confirmation message
    setLoading(false);

    // Step 4: Redirect to login after a short pause (3 seconds)
    setTimeout(() => router.push("/public/login"), 3000);
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
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="admin"
              checked={signupAs === "admin"}
              onChange={() => setSignupAs("admin")}
            />
            Admin
          </label>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-red-600">Warning:</span> Only select Admin for trusted accounts. For production, restrict admin role assignment to internal users.
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
          <a className="text-blue-600 hover:underline" href="/public/login">
            Log in
          </a>
        </p>
      </form>
      {success && (
        <div className="mt-6 p-4 rounded shadow bg-green-50 text-green-700 border border-green-300 text-center">
          Please check your email to confirm your registration.
        </div>
      )}
    </main>
  );
}
