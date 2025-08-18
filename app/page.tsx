import { createServerClientRSC } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerClientRSC(); // <-- await
  const { data: boxes, error } = await supabase
    .from("boxes")
    .select("id,title,price_cents,qty_available,image_url")
    .order("created_at", { ascending: false });

  if (error) return <main className="p-6">DB error: {error.message}</main>;
  if (!boxes?.length) return <main className="p-6">No boxes yet.</main>;

  return (
    <main className="p-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {boxes.map((b) => (
        <div
          key={b.id}
          className="border rounded-2xl p-4 bg-white shadow hover:shadow-lg transition"
        >
          <img
            src={b.image_url || "/placeholder.webp"}
            className="w-full h-40 object-cover rounded-lg"
            alt={b.title}
          />
          <div className="mt-3 text-lg font-semibold">{b.title}</div>
          <div className="text-gray-700">₩ {(b.price_cents / 100).toLocaleString()}</div>
          <div className={b.qty_available === 0 ? "text-red-600 font-medium mt-1" : "mt-1 text-gray-600"}>
            {b.qty_available === 0 ? "Sold out" : `${b.qty_available} left`}
          </div>
        </div>
      ))}
    </main>
  );
}
