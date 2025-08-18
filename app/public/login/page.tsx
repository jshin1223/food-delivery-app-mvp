"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    alert(error?.message ?? "Login failed or session not created.");
    return;
  }
  const { user } = data.session;
  console.log("Logged in user:", user);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  console.log("Profile fetch result:", profile, "Error:", profileError);

  if (profileError || !profile?.roles) {
    router.push("/browse");
    return;
  }

console.log("Roles from DB:", profile.roles);

if (Array.isArray(profile.roles)) {
  if (profile.roles.includes("restaurant")) {
    console.log("Redirecting to /restaurant/dashboard");
    router.push("/restaurant/dashboard");
  } else if (profile.roles.includes("admin")) {
    console.log("Redirecting to /admin/dashboard");
    router.push("/admin/dashboard");
  } else if (profile.roles.includes("customer")) {
    console.log("Redirecting to /customer/dashboard");
    router.push("/customer/dashboard");
  } else {
    console.log("No known role match, redirecting to /browse");
    router.push("/browse");
  }
} else {
  console.log("roles is not an array, redirect to /browse");
  router.push("/browse");
}

    if (Array.isArray(profile.roles)) {
      if (profile.roles.includes("restaurant")) {
        router.push("/restaurant/dashboard");
      } else if (profile.roles.includes("admin")) {
        router.push("/admin/dashboard");
      } else if (profile.roles.includes("customer")) {
        router.push("/customer/dashboard");
      } else {
        router.push("/browse");
      }
    } else {
      router.push("/browse");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Log In</button>
    </form>
  );
}
