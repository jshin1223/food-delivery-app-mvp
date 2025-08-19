'use server';

import { supabaseServer } from "@/lib/supabase/server";

// List Boxes
export async function getMyBoxes() {
  const sb = await supabaseServer();
  const { data: { user }, error: authError } = await sb.auth.getUser();
  if (authError || !user) throw new Error("Not signed in");

  const { data: profile } = await sb.from("profiles").select("roles").eq("id", user.id).single();
  if (!profile?.roles?.includes("restaurant")) throw new Error("Not authorized");

  const { data, error } = await sb
    .from("boxes")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// Create Box
export async function createBox(formData: FormData) {
  const sb = await supabaseServer();
  const { data: { user }, error: authError } = await sb.auth.getUser();
  if (authError || !user) throw new Error("Not signed in");

  const { data: profile } = await sb.from("profiles").select("roles").eq("id", user.id).single();
  if (!profile?.roles?.includes("restaurant")) throw new Error("Not authorized");

  const title = String(formData.get("title") || "");
  const price_cents = Number(formData.get("price_cents") || 0);
  const qty_available = Number(formData.get("qty_available") || 0);
  const image_url = String(formData.get("image_url") || "");

  if (!title || price_cents < 0 || qty_available < 0) throw new Error("Invalid input");

  const { error } = await sb.from("boxes").insert({
    owner_id: user.id,
    title,
    price_cents,
    qty_available,
    image_url,
  });

  if (error) throw new Error(error.message);
}

// Update Box (no stock restrictions)
export async function updateBox(formData: FormData) {
  const sb = await supabaseServer();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "");
  const price_cents = Number(formData.get("price_cents") || 0);
  const qty_available = Number(formData.get("qty_available") || 0);
  const image_url = String(formData.get("image_url") || "");

  if (!id || !title || price_cents < 0 || qty_available < 0) throw new Error("Invalid input");

  const { error } = await sb.from("boxes").update({
    title,
    price_cents,
    qty_available,
    image_url,
  }).eq("id", id);

  if (error) throw new Error(error.message);
}

// Delete Box
export async function deleteBox(formData: FormData) {
  const sb = await supabaseServer();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Invalid input");

  const { error } = await sb.from("boxes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
