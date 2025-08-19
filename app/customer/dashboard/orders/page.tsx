import { supabaseServerRSC } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const supabase = supabaseServerRSC();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login"); // Or show message
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, qty, amount_cents, status, created_at, box:title (title)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-red-500">Failed to load orders</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {!orders?.length ? (
        <p>No orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border p-4 rounded shadow-sm bg-white space-y-1">
              <div className="font-semibold">{order.box.title}</div>
              <div className="text-sm">Qty: {order.qty}</div>
              <div className="text-sm">Amount: ${(order.amount_cents / 100).toFixed(2)}</div>
              <div className="text-sm text-gray-500">Status: {order.status}</div>
              <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
