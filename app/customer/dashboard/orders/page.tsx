// app/customer/orders/page.tsx
import { supabaseServerRSC } from "@/lib/supabase/server";

export default async function CustomerOrdersPage() {
  const supabase = await supabaseServerRSC();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <p className="p-6">Please sign in.</p>;

  const { data: orders } = await supabase
    .from("orders")
    .select("id, qty, unit_price_cents, status, created_at, boxes(title)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {!orders?.length ? (
        <p>No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{o.boxes?.title ?? "Box"}</div>
                <div className="text-sm">
                  Qty {o.qty} • ${(o.unit_price_cents / 100).toFixed(2)}
                </div>
                <div className="text-xs opacity-70">
                  {new Date(o.created_at).toLocaleString()}
                </div>
              </div>
              <div className="text-sm">{o.status}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
