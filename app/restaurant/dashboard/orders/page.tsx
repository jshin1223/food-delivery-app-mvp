// app/restaurant/dashboard/orders/page.tsx
import { supabaseServerRSC } from "@/lib/supabase/server";

export default async function RestaurantOrdersPage() {
  const supabase = await supabaseServerRSC();

  // 1) Who am I?
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <p>Please sign in as a restaurant to view your orders.</p>
      </main>
    );
  }

  // 2) Get my boxes (ids + titles/images for display)
  const { data: myBoxes, error: boxesErr } = await supabase
    .from("boxes")
    .select("id, title, image_url, price_cents")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (boxesErr) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <p className="text-red-600">Failed to load boxes: {boxesErr.message}</p>
      </main>
    );
  }

  const boxIds = (myBoxes ?? []).map((b) => b.id);
  if (!boxIds.length) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <p>You don’t have any boxes yet, so there are no orders.</p>
      </main>
    );
  }

  // 3) Fetch orders for those boxes (no join → fewer 400s)
  const { data: orders, error: ordersErr } = await supabase
    .from("orders")
    .select("id, box_id, customer_id, qty, amount_cents, status, created_at")
    .in("box_id", boxIds)
    .order("created_at", { ascending: false });

  if (ordersErr) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <p className="text-red-600">Failed to load orders: {ordersErr.message}</p>
      </main>
    );
  }

  // Map for quick display data
  const boxMap = Object.fromEntries(
    (myBoxes ?? []).map((b) => [b.id, b])
  );

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {!orders?.length ? (
        <p>No orders placed for your boxes yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const b = boxMap[o.box_id];
            return (
              <li
                key={o.id}
                className="border rounded p-3 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="font-semibold">{b?.title ?? "Box"}</div>
                  <div className="text-sm">
                    Qty {o.qty} • $
                    {(o.amount_cents / 100).toLocaleString("en-US")}
                  </div>
                  <div className="text-xs opacity-70">
                    {new Date(o.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm mt-1">Status: {o.status}</div>
                  <div className="text-xs opacity-70 mt-1">
                    Customer: {o.customer_id}
                  </div>
                </div>
                {b?.image_url ? (
                  <img
                    src={b.image_url}
                    alt={b.title ?? "Box"}
                    className="w-24 rounded"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
