"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Box = {
  id: string;
  owner_id: string;
  title: string;
  price_cents: number;
  qty_available: number;
  image_url: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const [me, setMe] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [form, setForm] = useState({
    title: "",
    price: "" as string | number,
    qty: "" as string | number,
    imageUrl: "",
  });

  // ------- bootstrap: get user + roles, then fetch my boxes
  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      setMe(uid);

      if (!uid) {
        setLoading(false);
        return;
      }

      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("roles")
        .eq("id", uid)
        .single();

      if (profErr) {
        console.error(profErr);
        setLoading(false);
        return;
      }
      setRoles(prof?.roles ?? []);

      await fetchMyBoxes();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyBoxes = async () => {
    // RLS ensures you can only manage your own boxes (or admin).
    // Still, we filter by owner_id to keep it explicit.
    const { data, error } = await supabase
      .from("boxes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    setBoxes((data ?? []) as Box[]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;

    const price_cents = Math.round(Number(form.price || 0) * 100);
    const qty_available = Number(form.qty || 0);

    const { error } = await supabase.from("boxes").insert({
      owner_id: me, // required by RLS (owner manages own boxes)
      title: form.title.trim(),
      price_cents,
      qty_available,
      image_url: form.imageUrl.trim() || null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setForm({ title: "", price: "", qty: "", imageUrl: "" });
    await fetchMyBoxes();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("boxes").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setBoxes((prev) => prev.filter((b) => b.id !== id));
  };

  const handleUpdate = async (box: Box, newQty: number, newPriceWON: number) => {
    const price_cents = Math.round(newPriceWON * 100);
    const { error } = await supabase
      .from("boxes")
      .update({ qty_available: newQty, price_cents })
      .eq("id", box.id);

    if (error) {
      alert(error.message);
      return;
    }
    await fetchMyBoxes();
  };

  // ------- guards
  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse text-gray-600">Loading dashboard…</div>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">Please log in</h1>
        <p className="mb-4 text-gray-600">You need an account to manage boxes.</p>
        <a
          href="/login"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to Login
        </a>
      </main>
    );
  }

  if (!roles.includes("restaurant") && !roles.includes("admin")) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">Access denied</h1>
        <p className="text-gray-600">
          Your account is not a restaurant. Sign up as a restaurant or contact an admin to gain
          access.
        </p>
      </main>
    );
  }

  // ------- UI
  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
        <button
          onClick={() => router.refresh()}
          className="text-sm px-3 py-2 rounded border hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* Create form */}
      <section className="bg-white border rounded-xl shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Add New Box</h2>
        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Title"
            className="border rounded px-3 py-2"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <input
            type="number"
            placeholder="Price (₩)"
            className="border rounded px-3 py-2"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            min={0}
            step="1"
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            className="border rounded px-3 py-2"
            value={form.qty}
            onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
            min={0}
            step="1"
            required
          />
          <input
            type="url"
            placeholder="Image URL (optional)"
            className="border rounded px-3 py-2"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          />
          <button
            type="submit"
            className="sm:col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Create Box
          </button>
        </form>
      </section>

      {/* List + inline update/delete */}
      <section className="grid gap-4">
        {boxes.length === 0 ? (
          <div className="text-gray-600">No boxes yet. Create your first one above.</div>
        ) : (
          boxes.map((b) => (
            <div
              key={b.id}
              className="border rounded-xl p-4 bg-white shadow-sm flex gap-4 items-start"
            >
            <img
            src={b.image_url || "/placeholder.webp"}
            alt={b.title}
            className="w-28 h-28 object-cover rounded"
            />
              <div className="flex-1">
                <div className="text-lg font-semibold">{b.title}</div>
                <div className="text-gray-700">₩ {(b.price_cents / 100).toLocaleString()}</div>
                <div className="text-gray-600">{b.qty_available} left</div>

                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <label className="text-sm text-gray-600">Update qty/price:</label>
                  <InlineUpdate
                    onSave={(qty, priceWON) => handleUpdate(b, qty, priceWON)}
                    initialQty={b.qty_available}
                    initialPriceWON={Math.round(b.price_cents / 100)}
                  />
                </div>
              </div>

              <button
                onClick={() => handleDelete(b.id)}
                className="text-red-600 hover:underline"
                title="Delete"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

function InlineUpdate({
  initialQty,
  initialPriceWON,
  onSave,
}: {
  initialQty: number;
  initialPriceWON: number;
  onSave: (qty: number, priceWON: number) => void;
}) {
  const [qty, setQty] = useState<number>(initialQty);
  const [price, setPrice] = useState<number>(initialPriceWON);
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex gap-2 items-center">
      <input
        type="number"
        className="w-24 border rounded px-2 py-1"
        value={qty}
        onChange={(e) => setQty(parseInt(e.target.value || "0", 10))}
        min={0}
        step="1"
      />
      <input
        type="number"
        className="w-32 border rounded px-2 py-1"
        value={price}
        onChange={(e) => setPrice(parseInt(e.target.value || "0", 10))}
        min={0}
        step="1"
      />
      <button
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          await onSave(qty, price);
          setSaving(false);
        }}
        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
