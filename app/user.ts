import { headers } from "next/headers";
import { SESSION_COOKIE, readCookie, readSession, type SessionUser } from "./session";

// Identity comes only from the signed fp_session cookie set by /auth/callback.
// Platform identity headers (oai-authenticated-*) are ignored in production so
// a client cannot forge them. In local dev the Sites vite plugin still injects
// them, which keeps the no-Google local sign-in working.

export type AppUser = SessionUser & { displayName: string };

export const SIGN_IN_PATH = "/auth/google";
export const SIGN_OUT_PATH = "/auth/signout";

export async function getUser(): Promise<AppUser | null> {
  const requestHeaders = await headers();
  const session = await readSession(readCookie(requestHeaders.get("cookie"), SESSION_COOKIE));
  if (session) return { ...session, displayName: session.fullName ?? session.email };

  if (import.meta.env.DEV) {
    const userId = requestHeaders.get("oai-authenticated-user-id");
    const email = requestHeaders.get("oai-authenticated-user-email");
    if (userId && email) {
      const raw = requestHeaders.get("oai-authenticated-user-full-name");
      let fullName: string | null = null;
      try { fullName = raw ? decodeURIComponent(raw) : null; } catch { fullName = null; }
      return { userId, email, fullName, displayName: fullName ?? email };
    }
  }
  return null;
}

export function signInPath(returnTo: string): string {
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(returnTo)}`;
}

export function signOutPath(returnTo = "/"): string {
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(returnTo)}`;
}
