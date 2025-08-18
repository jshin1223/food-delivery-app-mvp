// app/public/actions.ts
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const supabase = await supabaseServer(); // ✅ await

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No user after login." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  const roles: string[] = profile?.roles ?? [];
  const dest = roles.includes("admin")
    ? "/admin/orders"
    : roles.includes("restaurant")
    ? "/restaurant/dashboard"
    : roles.includes("customer")
    ? "/customer/orders"
    : "/";

  revalidatePath("/");
  redirect(dest);
}

export async function purchaseBox(boxId: string, qty: number) {
  const supabase = await supabaseServer(); // ✅ await
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data, error } = await supabase.rpc("purchase_box", {
    p_customer_id: user.id, p_box_id: boxId, p_qty: qty,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/customer/orders");
  return { ok: true, orderId: data as string };
}
