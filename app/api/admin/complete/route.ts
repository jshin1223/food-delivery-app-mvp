import { NextResponse } from "next/server";
import { createServerClientForRoute } from "../../../../lib/supabase/server";

export async function PATCH(req: Request) {
  const supabase = await createServerClientForRoute();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile?.roles || !Array.isArray(profile.roles) || !profile.roles.includes("admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { id?: string; status?: "completed" | "pending" | "cancelled" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = body.id;
  const status = body.status ?? "completed";
  if (!id) {
    return NextResponse.json({ error: "Order id is required" }, { status: 400 });
  }

  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
