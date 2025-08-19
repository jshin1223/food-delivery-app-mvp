// app/customer/dashboard/orders/page.tsx
import { supabaseServerRSC } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CustomerOrdersPage() {
  const supabase = await supabaseServerRSC();

  // must be signed in
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    redirect("/public/login?next=/customer/dashboard/orders");
  }

  /**
   * IMPORTANT:
   * Your orders table: id, customer_id, box_id, qty, amount_cents, status, created_at
   * We join the referenced box by telling Supabase the relationship is via box_id -> boxes.id.
   * If your FK exists (recommended), this works:
   *   boxes:box_id (id, title, image_url, price_cents)
   * If you don’t have a FK, either add it or fall back to two queries.
   */
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        qty,
        amount_cents,
        status,
        created_at,
        boxes:box_id ( id, title, image_url, price_cents )
      `
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    // show a friendly error if RLS or columns mismatch
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Orders</h1>
        <p className="text-red-600">Failed to load orders: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {!orders?.length ? (
        <p>No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="border rounded p-3 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <div className="font-semibold">
                  {o.boxes?.title ?? "Box"}
                </div>
                <div className="text-sm">
                  Qty {o.qty} • $
                  {(o.amount_cents / 100).toLocaleString("en-US")}
                </div>
                <div className="text-xs opacity-70">
                  {new Date(o.created_at).toLocaleString()}
                </div>
                {o.status && (
                  <div className="mt-1 text-sm">Status: {o.status}</div>
                )}
              </div>
              {o.boxes?.image_url ? (
                <img
                  src={o.boxes.image_url}
                  alt={o.boxes.title ?? "Box"}
                  className="w-24 rounded"
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
