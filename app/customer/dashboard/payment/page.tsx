import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { supabaseServerRSC } from "@/lib/supabase/server";
import AmountClient from "./AmountClient";

// Server action: create order + decrement stock, then redirect
export async function purchase(formData: FormData) {
  "use server";
  const supabase = createServerActionClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const boxId = formData.get("box_id") as string;
  const qty = Number(formData.get("qty"));

  // Pull latest stock/price
  const { data: box, error: boxErr } = await supabase
    .from("boxes")
    .select("qty_available, price_cents")
    .eq("id", boxId)
    .single();

  if (boxErr || !box) throw new Error("Box not found");
  if (!Number.isFinite(qty) || qty < 1 || qty > box.qty_available) {
    throw new Error("Invalid quantity");
  }

  // Insert order
  const amount_cents = box.price_cents * qty;
  const { error: orderErr } = await supabase.from("orders").insert({
    customer_id: user.id,
    box_id: boxId,
    qty,
    amount_cents,
    status: "pending",
  });
  if (orderErr) throw new Error(orderErr.message);

  // Decrement stock
  const { error: stockErr } = await supabase
    .from("boxes")
    .update({ qty_available: box.qty_available - qty })
    .eq("id", boxId);
  if (stockErr) throw new Error(stockErr.message);

  redirect("/customer/dashboard/orders");
}

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: { box_id?: string };
}) {
  const boxId = searchParams?.box_id;
  const supabase = await supabaseServerRSC();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/public/login?next=/customer/dashboard/payment");
  }

  // Check role: profiles.roles includes "customer"
  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  const isCustomer =
    Array.isArray(profile?.roles) && profile.roles.includes("customer");
  if (!isCustomer) {
    return (
      <main className="max-w-md mx-auto mt-10 p-4">
        <p className="text-red-600">Only customers can make purchases.</p>
      </main>
    );
  }

  if (!boxId) {
    return (
      <main className="max-w-md mx-auto mt-10 p-4">
        <p className="text-red-600">Missing box_id.</p>
      </main>
    );
  }

  const { data: box, error } = await supabase
    .from("boxes")
    .select("id, title, price_cents, qty_available")
    .eq("id", boxId)
    .single();

  if (error || !box) {
    return (
      <main className="max-w-md mx-auto mt-10 p-4">
        <p className="text-red-600">Box not found.</p>
      </main>
    );
  }

  const priceText = (box.price_cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <form action={purchase} className="space-y-4 max-w-md mx-auto mt-10">
      <input type="hidden" name="box_id" value={box.id} />

      <div className="font-semibold text-lg">{box.title}</div>
      <div>Price: {priceText}</div>
      <div>Available: {box.qty_available}</div>

      {/* Client section that live-updates the total */}
      <AmountClient priceCents={box.price_cents} maxQty={box.qty_available} />

      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">
        Purchase
      </button>
    </form>
  );
}
