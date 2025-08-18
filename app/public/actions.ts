// app/public/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No user after login." };

  // ensure profile row exists with single-role default
  await supabase.from("profiles").upsert({ id: user.id, role: "customer" }, { onConflict: "id" });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role as "customer"|"restaurant"|"admin"|undefined;

  const dest = role === "admin"
    ? "/admin/orders"
    : role === "restaurant"
    ? "/restaurant/dashboard"
    : "/customer/orders";

  revalidatePath("/");
  redirect(dest);
}

export async function logout() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}
