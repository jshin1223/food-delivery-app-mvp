import Image from "next/image";
import Link from "next/link";
import { supabaseServerRSC } from "@/lib/supabase/server";

export default async function CustomerDashboardPage() {
  const supabase = supabaseServerRSC();
  const { data: { user }} = await supabase.auth.getUser();

  let isCustomer = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("roles")
      .eq("id", user.id)
      .single();
    isCustomer = Array.isArray(profile?.roles) && profile.roles.includes("customer");
  }

  const { data: boxes } = await supabase
    .from("boxes")
    .select("id, title, price_cents, qty_available, image_url")
    .order("created_at", { ascending: false });

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Browse Boxes</h1>
      {!boxes?.length ? (
        <p className="text-gray-600">No boxes available.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {boxes.map((b) => {
            const soldOut = (b.qty_available ?? 0) <= 0;
            return (
              <li key={b.id} className="border rounded-xl overflow-hidden">
                <div className="relative w-full aspect-[4/3]">
                  <Image
                    src={b.image_url || "/placeholder.webp"}
                    alt={b.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="font-semibold">{b.title}</h3>
                  <div className="text-sm text-gray-500">
                    {(b.price_cents / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}{" "}
                    • {b.qty_available} left
                  </div>
                  {isCustomer && (
                    <Link
                      href={`/customer/dashboard/payment?box_id=${b.id}`}
                      className={`block w-full rounded-lg px-3 py-2 bg-blue-600 text-white text-center mt-2${soldOut ? " opacity-50 pointer-events-none" : ""}`}
                      aria-disabled={soldOut}
                      tabIndex={soldOut ? -1 : 0}
                    >
                      {soldOut ? "Sold out" : "Reserve"}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
