import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

function hasAny(roles: string[] | null | undefined, allowed: string[]) {
  return !!roles && allowed.some((r) => roles.includes(r));
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Use auth-helpers' middleware client for session compatibility
  const supabase = createMiddlewareClient({ req, res });

  const { pathname } = req.nextUrl;
  const needsRestaurant = pathname.startsWith("/restaurant");
  const needsAdmin = pathname.startsWith("/admin");

  // Only guard these paths
  if (!needsRestaurant && !needsAdmin) return res;

  // Must be logged in
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/public/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Read roles[] from profiles
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  if (error) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Restaurant area allows restaurant OR admin
  if (needsRestaurant && !hasAny(profile?.roles, ["restaurant", "admin"])) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Admin area allows admin only
  if (needsAdmin && !hasAny(profile?.roles, ["admin"])) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/restaurant/:path*", "/admin/:path*"],
};
