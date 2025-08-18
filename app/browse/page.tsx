// app/browse/page.tsx
import Image from "next/image";
import { supabaseServerRSC } from "@/lib/supabase/server";
import BoxesRealtimeClient from "@/components/BoxesRealtimeClient";

export default async function BrowsePage() {
  const supabase = await supabaseServerRSC();
  const { data: boxes } = await supabase
    .from("boxes")
    .select("id, title, price_cents, qty_available, image_url")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Browse Boxes</h1>
      <BoxesRealtimeClient />

      {!boxes?.length ? (
        <p className="text-gray-600">No boxes yet.</p>
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

                  <form
                    action={async () => {
                      "use server";
                      const supabase = await supabaseServerRSC();
                      await supabase.rpc("purchase_box", {
                        p_box_id: b.id,
                        p_customer_id: "REPLACE_ME", // <-- Fix this
                        p_qty: 1,
                      });
                    }}
                  >
                    <button
                      type="submit"
                      disabled={soldOut}
                      className="w-full rounded-lg px-3 py-2 bg-blue-600 text-white disabled:opacity-50"
                    >
                      {soldOut ? "Sold out" : "Reserve"}
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
