// lib/apiGuard.ts - Guard untuk API route management (wajib session login)
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SessionPayload } from "@/lib/auth";

// Kembalikan session jika valid, atau null (pemanggil harus return 401).
export async function requireSession(
  request: NextRequest
): Promise<SessionPayload | null> {
  const token = request.cookies.get("tapak_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
