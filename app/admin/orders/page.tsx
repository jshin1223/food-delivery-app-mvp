'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AdminOrders() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all'|'pending'|'completed'>('all');

  const fetchRows = async () => {
    let query = supabase.from('orders').select('*, boxes(title), profiles:customer_id(email)').order('created_at',{ascending:false});
    if (status !== 'all') query = query.eq('status', status);
    const { data } = await query;
    const filtered = (data ?? []).filter((r:any) =>
      r.boxes?.title?.toLowerCase().includes(q.toLowerCase()) ||
      r.profiles?.email?.toLowerCase().includes(q.toLowerCase()) ||
      r.id?.toLowerCase().includes(q.toLowerCase())
    );
    setRows(filtered);
  };

  useEffect(() => {
    fetchRows();
    const sub = supabase.channel('orders-rt').on('postgres_changes', { event:'*', schema:'public', table:'orders' }, fetchRows).subscribe();
    return () => { sub.unsubscribe(); };
  }, [status]);

  useEffect(() => { const id = setTimeout(fetchRows, 250); return ()=>clearTimeout(id); }, [q]);

  const complete = async (id:string) => {
    const res = await fetch('/api/admin/complete', { method:'POST', body: JSON.stringify({ id }) });
    if (!res.ok) alert('Failed to complete');
  };

  return (
    <div className="grid gap-3">
      <h1 className="text-xl font-semibold">All Orders</h1>
      <div className="flex gap-2">
        <input className="input flex-1" placeholder="Search (customer, box, id)" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="input" value={status} onChange={e=>setStatus(e.target.value as any)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <ul className="grid gap-2">
        {rows.map((r:any)=>(
          <li key={r.id} className="border rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.boxes?.title} · {r.qty} × ${(r.unit_price_cents/100).toFixed(2)}</div>
              <div className="text-sm opacity-70">{r.profiles?.email} · {r.status} · {new Date(r.created_at).toLocaleString()}</div>
            </div>
            {r.status==='pending' && <button className="btn" onClick={()=>complete(r.id)}>Mark complete</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
