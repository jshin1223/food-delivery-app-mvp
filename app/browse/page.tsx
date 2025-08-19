// app/browse/page.tsx
import Image from "next/image";
import { supabaseServerRSC } from "@/lib/supabase/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// ✅ Server action for purchasing
export async function purchase(formData: FormData) {
  "use server";
  const supabase = createServerActionClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not signed in");

  const boxId = formData.get("box_id") as string;

  const { error } = await supabase.rpc("purchase_box", {
    p_box_id: boxId,
    p_customer_id: user.id,
    p_qty: 1,
  });

  if (error) throw new Error(error.message);
}

export default async function BrowsePage() {
  const supabase = await supabaseServerRSC();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isCustomer = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("roles")
      .eq("id", user.id)
      .single();

    // roles is expected to be an array, e.g., ["customer"]
    isCustomer = Array.isArray(profile?.roles) && profile.roles.includes("customer");
  }

  const { data: boxes } = await supabase
    .from("boxes")
    .select("id, title, price_cents, qty_available, image_url")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
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
                    {(b.price_cents / 100).toLocaleString(undefined, {
                      style: "currency",
                      currency: "USD",
                    })}{" "}
                    • {b.qty_available} left
                  </div>

                  {isCustomer && (
                    <a
                      href={`/customer/dashboard/payment?box_id=${b.id}`}
                      className={`block w-full rounded-lg px-3 py-2 bg-blue-600 text-white text-center ${
                        soldOut ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {soldOut ? "Sold out" : "Reserve"}
                    </a>
                  )}

                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
