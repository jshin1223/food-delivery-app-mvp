"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "restaurant" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/public/login"); // Redirect to login if not authenticated
        return;
      }

      // Fetch user profile data
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("id", user.id)
        .single();

      if (error) {
        setError("Error fetching profile");
      } else {
        setFullName(data?.full_name || "");
        setEmail(data?.email || "");
        setRole(data?.role || null);
      }

      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("User not authenticated");
      return;
    }

    // Update user profile
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, email, role })
      .eq("id", user.id);

    if (error) {
      setError("Error updating profile");
    } else {
      alert("Profile updated successfully!");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      {error && <p className="text-red-600">{error}</p>}

      <div>
        <label className="block">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          disabled
        />
      </div>

      <div>
        <label className="block">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "customer" | "restaurant" | "admin")}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="customer">Customer</option>
          <option value="restaurant">Restaurant</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
