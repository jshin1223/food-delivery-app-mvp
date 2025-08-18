import Link from "next/link";
import { supabaseServerRSC } from "@/lib/supabase/server";
import { logout } from "@/app/public/actions";

export const dynamic = "force-dynamic"; // ensure SSR re-evaluates per request

export default async function Navbar() {
  const supabase = await supabaseServerRSC();
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
        {/* Left nav links */}
        <div className="flex gap-4 text-sm items-center">
          <Link href="/" className="text-lg font-bold">Wyzly</Link>
          <Link href="/">Browse</Link>
          {user && isCustomer && <Link href="/customer/orders">My Orders</Link>}
          {user && isRestaurant && <Link href="/restaurant/dashboard">Restaurant Dashboard</Link>}
          {user && isAdmin && <Link href="/admin/orders">Admin Orders</Link>}
        </div>
        {/* Right nav links */}
        <div className="flex gap-4 text-sm items-center">
          {!user && (
            <>
              <Link href="/public/login">Login</Link>
              <Link href="/public/signup">Sign Up</Link>
            </>
          )}
          {user && (
            <form action={logout}>
              <button type="submit" className="underline">Logout</button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
}
