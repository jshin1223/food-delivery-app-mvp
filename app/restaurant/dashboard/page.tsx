"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Role = "customer" | "restaurant" | "admin" | null;

export default function Navbar() {
  const supabase = createSupabaseBrowserClient();
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error || !data?.role) {
          console.warn("Error fetching role or no role:", error);
          setRole(null);
        } else {
          setRole(data.role as Role);
        }
      } catch (err) {
        console.error("Failed to fetch role:", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  return (
    <nav className="w-full bg-blue-600 text-white px-6 py-3 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Wyzly
        </Link>

        <div className="flex gap-4 items-center">
          <Link href="/browse" className="hover:underline">
            Browse
          </Link>

          {loading ? null : (
            <>
              {role === null && (
                <Link href="/public/login" className="hover:underline">
                  Login
                </Link>
              )}
              {role === "customer" && (
                <>
                  <Link href="/customer/orders" className="hover:underline">
                    My Orders
                  </Link>
                  <Link href="/logout" className="hover:underline">
                    Logout
                  </Link>
                </>
              )}
              {role === "restaurant" && (
                <>
                  <Link href="/restaurant/dashboard" className="hover:underline">
                    Restaurant Dashboard
                  </Link>
                  <Link href="/logout" className="hover:underline">
                    Logout
                  </Link>
                </>
              )}
              {role === "admin" && (
                <>
                  <Link href="/admin/orders" className="hover:underline">
                    Admin Orders
                  </Link>
                  <Link href="/logout" className="hover:underline">
                    Logout
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
