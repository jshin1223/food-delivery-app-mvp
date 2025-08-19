"use client";

import { useEffect, useMemo, useState } from "react";

export default function AmountClient({
  priceCents,
  maxQty,
}: {
  priceCents: number;
  maxQty: number;
}) {
  const [qty, setQty] = useState(1);

  // keep input in sync if server provided max changes due to nav
  useEffect(() => {
    setQty((q) => Math.min(Math.max(1, q), maxQty));
  }, [maxQty]);

  const totalText = useMemo(() => {
    const total = (priceCents * qty) / 100;
    return total.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }, [priceCents, qty]);

  return (
    <>
      <label className="block text-sm font-medium">Quantity</label>
      <input
        name="qty"
        type="number"
        min={1}
        max={maxQty}
        value={qty}
        onChange={(e) => {
          const v = Number(e.target.value || 1);
          if (!Number.isFinite(v)) return;
          const clamped = Math.min(Math.max(1, v), maxQty);
          setQty(clamped);
        }}
        required
        className="w-full p-2 border rounded"
      />
      <div className="text-sm">
        Total: <span className="font-semibold">{totalText}</span>
      </div>
    </>
  );
}
