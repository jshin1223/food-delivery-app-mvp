'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { centsToDollars } from '@/lib/price';

type OrderRow = {
  id: string;
  created_at: string;
  status: 'pending' | 'completed';
  qty: number;
  unit_price_cents: number;
  amount_cents: number;
  boxes?: { title?: string | null } | null;
};

export default function Orders() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setRows([]); setLoading(false); return; }

    const { data, error } = await supabase
      .from('orders')
      .select('id,created_at,status,qty,unit_price_cents,amount_cents,boxes(title)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setRows((data as OrderRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    // realtime updates
    const sub = supabase
      .channel('orders-history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchRows)
      .subscribe();
    return () => { sub.unsubscribe(); };
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <div className="grid gap-3">
      <h1 className="text-xl font-semibold">Your Orders</h1>
      {rows.length === 0 && <div className="opacity-70">No orders yet.</div>}
      <ul className="grid gap-2">
        {rows.map((r) => (
          <li key={r.id} className="border rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">
                {r.boxes?.title ?? 'Box'} · {r.qty} × {centsToDollars(r.unit_price_cents)}
              </div>
              <div className="text-sm opacity-70">
                {r.status} · {new Date(r.created_at).toLocaleString()}
              </div>
            </div>
            <div className="text-sm">{centsToDollars(r.amount_cents)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
