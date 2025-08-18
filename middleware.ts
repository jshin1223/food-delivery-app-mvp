// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const requireRoles = (roles: string[]) => async (req: NextRequest) => {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/public/login", req.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  const allowed = (profile?.roles ?? []).some((r: string) => roles.includes(r));
  if (!allowed) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return res;
};

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);

  if (pathname.startsWith("/restaurant")) {
    return (await requireRoles(["restaurant", "admin"])(req))!;
  }
  if (pathname.startsWith("/admin")) {
    return (await requireRoles(["admin"])(req))!;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/restaurant/:path*", "/admin/:path*"],
};
