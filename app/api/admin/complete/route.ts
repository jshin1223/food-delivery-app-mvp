import { NextResponse } from "next/server";
// If you don't use "@/..." alias, use the relative path below:
import { createServerClientForRoute } from "../../../../lib/supabase/server";

export async function PATCH(req: Request) {
  const supabase = await createServerClientForRoute();

  // must be logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // must be admin
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 400 });
  }
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // parse body
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

  // update order status
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
