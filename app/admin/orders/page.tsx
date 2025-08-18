// app/admin/orders/page.tsx
import { supabaseServerRSC, supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function setOrderStatus(id: string, status: "pending" | "completed") {
  "use server";
  const supabase = await supabaseServer();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}

export default async function AdminOrdersPage() {
  const supabase = await supabaseServerRSC();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <p className="p-6">Please sign in.</p>;

  // Check if user is an admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return <p className="p-6">Not authorized.</p>;
  }

  // Fetch all orders for admins
  const { data: orders } = await supabase
    .from("orders")
    .select("id, qty, unit_price_cents, status, created_at, boxes(title)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin · Orders</h1>

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
              <form
                action={async () =>
                  setOrderStatus(
                    o.id,
                    o.status === "completed" ? "pending" : "completed"
                  )
                }
              >
                <button className="rounded px-3 py-1 border">
                  {o.status === "completed"
                    ? "Mark Pending"
                    : "Mark Completed"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
