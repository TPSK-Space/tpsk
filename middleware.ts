// middleware.ts - Domain routing (landing vs space) + login guard untuk space.
//
// Domain utama (tapakswaka.my.id)        -> landing  (app/(landing)/...)
// Subdomain space (space.tapakswaka.my.id) -> space   (app/space/...)
//
// Space diakses tanpa prefix "/space" di URL browser karena di-rewrite di sini.
// Contoh: space.tapakswaka.my.id/dashboard -> internal /space/dashboard

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

// Path publik di dalam area space (tanpa prefix /space saat dibandingkan)
const SPACE_PUBLIC_PATHS = ["/registrasi", "/ticket"];

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const isSpace = host.startsWith("space.");

  // ---------- LANDING (domain utama) ----------
  if (!isSpace) {
    return NextResponse.next();
  }

  // ---------- SPACE (subdomain) ----------
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Static assets / API: API routes tidak perlu prefix /space.
  // API routes dipanggil dari client space via /api/... (tetap di root app/api).
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Normalisasi path internal: prepend "/space"
  // "/"        -> "/space"
  // "/dashboard" -> "/space/dashboard"
  const internalPath =
    pathname === "/" ? "/space" : `/space${pathname}`;

  // Auth guard: halaman publik space boleh diakses tanpa login.
  const isPublic =
    pathname === "/" ||
    SPACE_PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!isPublic) {
    const token = request.cookies.get("tapak_session")?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      // Belum login -> redirect ke halaman login space (subdomain tetap).
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Rewrite ke path internal space (URL browser tetap bersih).
  url.pathname = internalPath;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
