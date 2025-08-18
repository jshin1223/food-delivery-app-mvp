// app/public/logout/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await supabaseServer(); // writable cookies OK in route handlers
  await supabase.auth.signOut();

  const { origin } = new URL(req.url);
  return NextResponse.redirect(`${origin}/`); // back to home
}
