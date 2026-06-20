import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Supabase may fall back to site_url with OAuth params on `/` — forward to the app bridge. */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  if (!code && !error) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/auth/callback";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|downloads|assets).*)"],
};
