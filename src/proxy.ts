import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const res = NextResponse.next();

  // Headers de segurança em todas as respostas
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // CORS restritivo para rotas de admin — bloqueia origens externas.
  if (request.nextUrl.pathname.startsWith("/api/9bkp")) {
    const origin = request.headers.get("origin");
    // Sem origin = same-origin (curl, SSR) → permite.
    if (origin) {
      const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL;
      if (!allowedOrigin || origin !== allowedOrigin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
