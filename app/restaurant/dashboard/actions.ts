"use server";

import { revalidatePath } from "next/cache";
import { supabaseServerRSC, supabaseServer } from "@/lib/supabase/server";

/** Fetch boxes for the logged-in restaurant (owner) */
export async function getMyBoxes() {
  const supabase = await supabaseServerRSC();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not signed in");
  }

  const { data, error } = await supabase
    .from("boxes")
    .select("*")
    .eq("owner_id", user.id) // ✅ use owner_id per your schema
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Create a new Wyzly Box */
export async function createBox(formData: FormData) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const title = (formData.get("title") as string)?.trim();
  const price_cents = Number(formData.get("price_cents"));
  const qty_available = Number(formData.get("qty_available"));
  const image_url = (formData.get("image_url") as string) || null;

  const { error } = await supabase.from("boxes").insert({
    owner_id: user.id,     // ✅ use owner_id
    title,
    price_cents,
    qty_available,
    image_url,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/restaurant/dashboard");
}

/** Update an existing box (owned by current user) */
export async function updateBox(formData: FormData) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const price_cents = Number(formData.get("price_cents"));
  const qty_available = Number(formData.get("qty_available"));
  const image_url = (formData.get("image_url") as string) || null;

  // Optional: enforce ownership in the update where clause
  const { error } = await supabase
    .from("boxes")
    .update({ title, price_cents, qty_available, image_url })
    .eq("id", id)
    .eq("owner_id", user.id); // ✅ only update your own

  if (error) throw new Error(error.message);

  revalidatePath("/restaurant/dashboard");
}

/** Delete a box (owned by current user) */
export async function deleteBox(formData: FormData) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("boxes")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id); // ✅ only delete your own

  if (error) throw new Error(error.message);

  revalidatePath("/restaurant/dashboard");
}
