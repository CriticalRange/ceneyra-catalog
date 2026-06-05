import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/session";

const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "ceneyra_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24,
  },
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const response = NextResponse.next();

    try {
      const session = await getIronSession<SessionData>(
        request,
        response,
        sessionOptions
      );
      if (!session.isAdmin) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
