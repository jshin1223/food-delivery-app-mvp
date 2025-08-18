// pages/reset-password.tsx
'use client';
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMessage("Failed to reset password.");
    else {
      setMessage("Password updated! You can log in again.");
      setTimeout(() => router.replace("/login"), 2000);
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Update password</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
