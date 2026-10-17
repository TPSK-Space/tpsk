// lib/auth.ts - Session token (JWT) helper untuk login
// Dipakai di server (route handler). Token disimpan client di cookie.

import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "tapakswaka-dev-secret-change-me"
);

export interface SessionPayload {
  id: string;
  username: string;
  nama: string | null;
  role_id: string | null;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
