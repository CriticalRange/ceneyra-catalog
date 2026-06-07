import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export interface SessionData {
  isAdmin: boolean;
  csrfToken?: string;
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "ceneyra_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60, // 1 hour
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getOrCreateCsrfToken(): Promise<string> {
  const session = await getSession();
  if (!session.csrfToken) {
    session.csrfToken = randomBytes(32).toString("hex");
    await session.save();
  }
  return session.csrfToken;
}

export async function validateCsrf(request: Request): Promise<boolean> {
  const session = await getSession();
  if (!session.isAdmin || !session.csrfToken) return false;
  const token = request.headers.get("x-csrf-token");
  return token === session.csrfToken;
}
