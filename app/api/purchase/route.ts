import { NextResponse } from "next/server";
// If you don't use "@/..." alias, use the relative path below:
import { createServerClientForRoute } from "../../../lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createServerClientForRoute();

  // must be logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // read body
  let body: { boxId?: string; qty?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const boxId = body.boxId;
  const qty = Number(body.qty ?? 1);
  if (!boxId || !qty || qty <= 0) {
    return NextResponse.json({ error: "boxId and qty (>0) are required" }, { status: 400 });
  }

  // call atomic purchase RPC
  const { data, error } = await supabase.rpc("purchase_box", {
    p_box_id: boxId,
    p_customer_id: user.id,
    p_qty: qty,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ orderId: data });
}
