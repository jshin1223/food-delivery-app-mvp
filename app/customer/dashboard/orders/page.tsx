// app/customer/dashboard/orders/page.tsx
import { supabaseServerRSC } from "@/lib/supabase/server";

export default async function CustomerOrdersPage() {
  const supabase = await supabaseServerRSC();

  // 1) Read user from cookies (never hard-crash)
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Orders</h1>
        <p>
          You must be signed in to view orders.{" "}
          <a className="text-blue-600 underline" href="/public/login?next=/customer/dashboard/orders">
            Sign in
          </a>
        </p>
      </main>
    );
  }

  // 2) Fetch orders (no joins; fewer chances of 400 due to metadata/FK)
  const { data: orders, error: ordersErr } = await supabase
    .from("orders")
    .select("id, box_id, qty, amount_cents, status, created_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (ordersErr) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Orders</h1>
        <p className="text-red-600">Failed to load orders: {ordersErr.message}</p>
      </main>
    );
  }

  // 3) If there are orders, fetch their boxes in one go
  let boxesById: Record<string, { id: string; title: string; image_url: string | null; price_cents: number }> = {};
  if (orders && orders.length > 0) {
    const boxIds = Array.from(new Set(orders.map((o) => o.box_id))).filter(Boolean) as string[];
    if (boxIds.length > 0) {
      const { data: boxes, error: boxesErr } = await supabase
        .from("boxes")
        .select("id, title, image_url, price_cents")
        .in("id", boxIds);

      if (!boxesErr && boxes) {
        boxesById = Object.fromEntries(boxes.map((b) => [b.id, b]));
      }
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {!orders?.length ? (
        <p>No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const box = boxesById[o.box_id] || null;
            return (
              <li key={o.id} className="border rounded p-3 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-semibold">{box?.title ?? "Box"}</div>
                  <div className="text-sm">
                    Qty {o.qty} • ${(o.amount_cents / 100).toLocaleString("en-US")}
                  </div>
                  <div className="text-xs opacity-70">
                    {new Date(o.created_at).toLocaleString()}
                  </div>
                  {o.status && <div className="mt-1 text-sm">Status: {o.status}</div>}
                </div>
                {box?.image_url ? (
                  <img src={box.image_url} alt={box.title ?? "Box"} className="w-24 rounded" />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
