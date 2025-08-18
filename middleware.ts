// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function hasAny(roles: string[] | null | undefined, allowed: string[]) {
  return !!roles && allowed.some((r) => roles.includes(r));
}

export async function middleware(req: NextRequest) {
  // Always create a response to pass into the SSR client cookie adapter
  const res = NextResponse.next();

  // Use @supabase/ssr in middleware so cookie format matches the rest of your app
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // write cookie to the response (middleware is allowed to modify cookies)
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const { pathname } = req.nextUrl;
  const needsRestaurant = pathname.startsWith("/restaurant");
  const needsAdmin = pathname.startsWith("/admin");

  // Only guard these paths
  if (!needsRestaurant && !needsAdmin) return res;

  // Must be logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/public/login";
    url.searchParams.set("next", pathname); // optional: send them back after login
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
