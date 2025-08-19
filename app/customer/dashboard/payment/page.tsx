import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { supabaseServerRSC } from "@/lib/supabase/server";

// Server Action - purchase
export async function purchase(formData: FormData) {
  "use server";
  const supabase = createServerActionClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const boxId = formData.get("box_id") as string;
  const qty = Number(formData.get("qty"));

  // Check availability
  const { data: box } = await supabase
    .from("boxes")
    .select("qty_available, price_cents")
    .eq("id", boxId)
    .single();

  if (!box || qty < 1 || qty > box.qty_available) throw new Error("Invalid quantity");

  // Insert order
  await supabase.from("orders").insert({
    customer_id: user.id,
    box_id: boxId,
    qty,
    amount_cents: box.price_cents * qty,
    status: "pending",
  });

  // Reduce stock
  await supabase.from("boxes").update({ qty_available: box.qty_available - qty }).eq("id", boxId);

  // Redirect to orders page
  redirect("/customer/dashboard/orders");
}

// Payment page
export default async function PaymentPage({ searchParams }: { searchParams: { box_id: string } }) {
  const boxId = searchParams.box_id;
  const supabase = supabaseServerRSC();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <p className="text-center mt-10 text-red-500">Please sign in to continue.</p>;

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  const isCustomer = Array.isArray(profile?.roles) && profile.roles.includes("customer");
  if (!isCustomer) return <p className="text-center mt-10 text-red-500">Only customers can make purchases.</p>;

  const { data: box } = await supabase
    .from("boxes")
    .select("*")
    .eq("id", boxId)
    .single();

  if (!box) return <div className="text-center mt-10">Box not found</div>;

  return (
    <form action={purchase} className="space-y-4 max-w-md mx-auto mt-10">
      <input type="hidden" name="box_id" value={boxId} />
      <div className="font-semibold text-lg">{box.title}</div>
      <div>
        Price: {(box.price_cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
      </div>
      <div>Available: {box.qty_available}</div>
      <input
        name="qty"
        type="number"
        min={1}
        max={box.qty_available}
        defaultValue={1}
        required
        className="w-full p-2 border"
      />
      <div>
        {/* Client-side total can be added via JS */}
        Total: {/* shown after submit */}
      </div>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">
        Purchase
      </button>
    </form>
  );
}
