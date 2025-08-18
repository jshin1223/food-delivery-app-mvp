// pages/forgot-password.tsx
'use client';
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const supabase = createSupabaseBrowserClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setMessage(error ? "Failed to send reset email." : "Check your email for a reset link.");
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send reset link</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
