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
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("roles")
        .eq("id", user.id)
        .single();

      if (error || !data?.roles) {
        console.warn("Error fetching role:", error);
        setRole(null);
      } else {
        setRole(data.roles as Role);
      }

      setLoading(false);
    };

    fetchRole();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
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
                <>
                  <Link href="/public/login" className="hover:underline">
                    Login
                  </Link>
                  <Link href="/public/signup" className="hover:underline">
                    Sign Up
                  </Link>
                </>
              )}

              {role === "customer" && (
                <>
                  <span className="text-sm text-gray-200">Logged in as Customer</span>
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
                  <span className="text-sm text-gray-200">Logged in as Restaurant</span>
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
                  <span className="text-sm text-gray-200">Logged in as Admin</span>
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
