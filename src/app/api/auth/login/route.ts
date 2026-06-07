import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { getSession } from "@/lib/session";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ip = getIp(request);
  const { allowed, retryAfter } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(retryAfter! / 60)} minute(s).` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const { password } = await request.json();

  const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
  const valid = hash && await compare(password ?? "", hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  resetRateLimit(ip);

  const session = await getSession();
  session.isAdmin = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
