// app/restaurant/dashboard/page.tsx
import { supabaseServer, supabaseServerRSC } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function createBox(fd: FormData) {
  "use server";
  const supabase = await supabaseServer(); // ✅ await
  const title = String(fd.get("title") || "");
  const price_cents = Number(fd.get("price_cents") || 0);
  const qty_available = Number(fd.get("qty_available") || 0);
  const image_url = String(fd.get("image_url") || "/placeholder.webp");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("boxes").insert({
    owner_id: user.id, title, price_cents, qty_available, image_url,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/restaurant/dashboard");
}

async function deleteBox(id: string) {
  "use server";
  const supabase = await supabaseServer(); // ✅ await
  const { error } = await supabase.from("boxes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/restaurant/dashboard");
}

export default async function RestaurantDashboard() {
  const supabase = await supabaseServerRSC(); // ✅ await
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <p className="p-6">Please sign in.</p>;

  const { data: boxes } = await supabase
    .from("boxes")
    .select("id,title,qty_available,price_cents,image_url")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Restaurant · Boxes</h1>

      <form action={createBox} className="grid grid-cols-1 sm:grid-cols-4 gap-2 border rounded p-3">
        <input name="title" placeholder="Title" className="border rounded px-2 py-1" required />
        <input name="price_cents" type="number" placeholder="Price (cents)" className="border rounded px-2 py-1" required />
        <input name="qty_available" type="number" placeholder="Qty" className="border rounded px-2 py-1" required />
        <input name="image_url" placeholder="Image URL" className="border rounded px-2 py-1 sm:col-span-4" />
        <div className="sm:col-span-4">
          <button className="rounded px-3 py-1 bg-blue-600 text-white">Create</button>
        </div>
      </form>

      {!boxes?.length ? (
        <p>No boxes yet.</p>
      ) : (
        <ul className="space-y-2">
          {boxes.map((b) => (
            <li key={b.id} className="border rounded p-3 flex justify-between items-center">
              <div>
                <div className="font-semibold">{b.title}</div>
                <div className="text-sm">Qty {b.qty_available} • ${(b.price_cents/100).toFixed(2)}</div>
              </div>
              <form action={async () => deleteBox(b.id)}>
                <button className="rounded px-3 py-1 border">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
