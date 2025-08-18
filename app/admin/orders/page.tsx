"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Row = {
  id: string;
  qty: number;
  amount_cents: number;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
  boxes: { title: string | null } | null;
  customer: { full_name: string | null } | null;
};

export default function AdminOrders() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [me, setMe] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "completed">("all");
  const [loading, setLoading] = useState(true);

  // 💡 Move fetchRows ABOVE useEffect
  const fetchRows = async () => {
    const query = supabase
      .from("orders")
      .select(
        `
        id, qty, amount_cents, status, created_at,
        boxes:boxes(title),
        customer:profiles!orders_customer_id_fkey(full_name)
        `
      )
      .returns<Row[]>() // 👈 tell TS the shape
      .order("created_at", { ascending: false });

    const qStatus = status !== "all" ? query.eq("status", status) : query;
    const { data, error } = await qStatus;
    if (error) {
      alert(error.message);
      return;
    }
    const rowsData = data ?? [];
    const qq = q.toLowerCase();
    const filtered = rowsData.filter((r) => {
      const t = r.boxes?.title?.toLowerCase() ?? "";
      const n = r.customer?.full_name?.toLowerCase() ?? "";
      const id = r.id.toLowerCase();
      return t.includes(qq) || n.includes(qq) || id.includes(qq);
    });
    setRows(filtered);
  };

  // --- bootstrap: get user + roles then fetch
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;
      setMe(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data: prof } = await supabase
        .from("profiles")
        .select("roles")
        .eq("id", uid)
        .single();
      setRoles(prof?.roles ?? []);
      setLoading(false);
      await fetchRows(); // ✅ Now it's accessible here
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    const fetchRows = async () => {
    const query = supabase
      .from("orders")
      .select(
        `
        id, qty, amount_cents, status, created_at,
        boxes:boxes(title),
        customer:profiles!orders_customer_id_fkey(full_name)
      `
      )
      .returns<Row[]>() // 👈 tell TS the shape
      .order("created_at", { ascending: false });

    const qStatus = status !== "all" ? query.eq("status", status) : query;

    const { data, error } = await qStatus;
    if (error) {
      alert(error.message);
      return;
    }

    const rowsData = data ?? []; // now typed as Row[] safely

    const qq = q.toLowerCase();
    const filtered = rowsData.filter((r) => {
      const t = r.boxes?.title?.toLowerCase() ?? "";
      const n = r.customer?.full_name?.toLowerCase() ?? "";
      const id = r.id.toLowerCase();
      return t.includes(qq) || n.includes(qq) || id.includes(qq);
    });

    setRows(filtered);
  };


  // realtime on orders
  useEffect(() => {
    const channel = supabase
      .channel("orders-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchRows()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch on status change
  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // debounce search
  useEffect(() => {
    const id = setTimeout(fetchRows, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const complete = async (id: string) => {
    const res = await fetch("/api/admin/complete", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      alert("Failed to complete");
      return;
    }
    fetchRows();
  };

  // --- guards
  if (loading) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse text-gray-600">Loading orders…</div>
      </main>
    );
  }
  if (!me) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">Please log in</h1>
        <a href="/login" className="text-blue-600 hover:underline">
          Go to login
        </a>
      </main>
    );
  }
  if (!roles.includes("admin")) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">Access denied</h1>
        <p className="text-gray-600">Only admins can manage all orders.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold">All Orders</h1>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Search (customer name, box title, order id)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <ul className="grid gap-2">
        {rows.map((r) => {
          const unit = r.qty > 0 ? r.amount_cents / r.qty : r.amount_cents;
          return (
            <li
              key={r.id}
              className="border rounded-xl p-3 flex items-center justify-between bg-white shadow-sm"
            >
              <div>
                <div className="font-medium">
                  {r.boxes?.title ?? "Untitled"} · {r.qty} × ₩ {(unit / 100).toLocaleString()}
                </div>
                <div className="text-sm opacity-70">
                  {r.customer?.full_name ?? "Unknown customer"} · {r.status} ·{" "}
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
              {r.status === "pending" && (
                <button
                  className="px-3 py-2 border rounded hover:bg-gray-50"
                  onClick={() => complete(r.id)}
                >
                  Mark complete
                </button>
              )}
            </li>
          );
        })}
        {rows.length === 0 && (
          <li className="text-gray-600">No orders match your filters.</li>
        )}
      </ul>
    </main>
  );
}
