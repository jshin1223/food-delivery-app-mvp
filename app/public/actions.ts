"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

// ✅ Supabase admin client using the service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Called from signup/page.tsx — secure profile insert

export async function seedProfile({
  userId,
  fullName,
  requestedRole,
}: {
  userId: string;
  fullName: string;
  requestedRole: "customer" | "restaurant" | "admin";
}) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // must be server-only
  );

  // ✅ allow all roles freely, including "admin"
  const roles = [requestedRole];

  const { error } = await supabaseAdmin
    .from("profiles")
    .upsert(
      {
        id: userId,
        full_name: fullName,
        roles,
      },
      { onConflict: "id" }
    );

  if (error) {
    throw new Error(`Failed to seed profile: ${error.message}`);
  }
}


// ✅ Called from login form (client POST → server action)
export async function login(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { ok: false, error: error.message };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No user after login." };

  // Ensure profile exists (only if user is in auth.users already)
  await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: user.user_metadata?.full_name ?? "",
        roles: ["customer"], // fallback role
      },
      { onConflict: "id" }
    );

  // Fetch role(s) to determine redirect
  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  const role = (profile?.roles?.[0] ?? "customer") as "customer" | "restaurant" | "admin";

  const dest =
    role === "admin"
      ? "/admin/orders"
      : role === "restaurant"
      ? "/restaurant/dashboard"
      : "/customer/orders";

  revalidatePath("/");
  redirect(dest);
}

// ✅ Sign-out server action
export async function logout() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}
