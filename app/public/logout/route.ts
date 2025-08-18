import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await supabaseServer(); // ✅ await
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url)); // back to Home
}

export const dynamic = "force-dynamic";
