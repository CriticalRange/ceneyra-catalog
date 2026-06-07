import { NextResponse } from "next/server";
import { getSession, getOrCreateCsrfToken } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = await getOrCreateCsrfToken();
  return NextResponse.json({ token });
}
