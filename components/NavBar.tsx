// components/Navbar.tsx
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
    const pickRole = (roles: string[] | null | undefined): Role => {
      if (!roles || roles.length === 0) return null;
      if (roles.includes("admin")) return "admin";
      if (roles.includes("restaurant")) return "restaurant";
      if (roles.includes("customer")) return "customer";
      return (roles[0] as Role) ?? null;
    };

    const fetchRole = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

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

      if (error) {
        console.warn("Error fetching roles:", error);
        setRole(null);
      } else {
        setRole(pickRole(data?.roles));
      }

      setLoading(false);
    };

    // initial fetch
    fetchRole();

    // subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

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
                  <Link href="/customer/dashboard/orders" className="hover:underline">
                    My Orders
                  </Link>
                  <Link href="/public/logout" className="hover:underline">
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
                  <Link href="/restaurant/dashboard/orders">Restaurant Orders</Link>
                  <Link href="/public/logout" className="hover:underline">
                    Logout
                  </Link>
                </>
              )}

              {role === "admin" && (
                <>
                  <span className="text-sm text-gray-200">Logged in as Admin</span>
                  <Link href="/admin/dashboard" className="hover:underline">
                    Admin Dashboard
                  </Link>
                  <Link href="/public/logout" className="hover:underline">
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
