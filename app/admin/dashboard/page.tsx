import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Server action for marking orders as completed/pending
export async function updateOrderStatus(formData: FormData) {
  "use server";
  const id = formData.get("order_id") as string;
  const currentStatus = formData.get("current_status") as string;
  const newStatus = currentStatus === "completed" ? "pending" : "completed";

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/orders");
}

export default async function AdminOrdersPage() {
  const supabase = await supabaseServer();

  // Fetch all orders, join box info (if foreign key available)
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      qty,
      amount_cents,
      status,
      created_at,
      box:box_id (title, image_url),
      customer_id
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="p-6 text-red-600">Failed to load orders: {error.message}</p>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin · Orders</h1>
      {!orders?.length ? (
        <p>No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{o.box?.title ?? "Box"}</div>
                <div className="text-sm">
                  Qty {o.qty} • ${(o.amount_cents / 100).toFixed(2)}
                </div>
                <div className="text-xs opacity-70">
                  {new Date(o.created_at).toLocaleString()}
                </div>
                <div className="text-xs">Customer ID: <span className="font-mono">{o.customer_id}</span></div>
                {o.box?.image_url && (
                  <img src={o.box.image_url} alt={o.box.title ?? "Box"} className="w-20 rounded mt-2" />
                )}
              </div>
              <form action={updateOrderStatus}>
                <input type="hidden" name="order_id" value={o.id} />
                <input type="hidden" name="current_status" value={o.status} />
                <button className="rounded px-3 py-1 border hover:bg-gray-100">
                  {o.status === "completed" ? "Mark Pending" : "Mark Completed"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
