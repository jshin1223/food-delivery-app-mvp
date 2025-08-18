// components/Navbar.tsx
import Link from "next/link";
import { supabaseServerRSC } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = await supabaseServerRSC(); // ✅ await
  const { data: { user } } = await supabase.auth.getUser();

  let roles: string[] = [];
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("roles")
      .eq("id", user.id)
      .single();
    roles = profile?.roles ?? [];
  }

  const isAdmin = roles.includes("admin");
  const isRestaurant = roles.includes("restaurant");
  const isCustomer = roles.includes("customer");

  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold">Wyzly</Link>
        <div className="flex gap-4 text-sm items-center">
          <Link href="/">Browse</Link>
          {!user && <Link href="/public/login">Login</Link>}
          {user && (
            <>
              {isAdmin ? (
                <Link href="/admin/orders">Admin Orders</Link>
              ) : isRestaurant ? (
                <Link href="/restaurant/dashboard">Restaurant Dashboard</Link>
              ) : isCustomer ? (
                <Link href="/customer/orders">My Orders</Link>
              ) : null}
              <Link href="/public/logout">Logout</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
