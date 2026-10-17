// app/api/auth/me/route.ts - Ambil info session user saat ini (dari cookie)
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("tapak_session")?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Ambil role name
  let role_name: string | null = null;
  if (session.role_id) {
    const { data } = await supabaseServer
      .from("roles")
      .select("name")
      .eq("id", session.role_id)
      .single();
    role_name = data?.name ?? null;
  }

  return NextResponse.json({
    user: {
      id: session.id,
      username: session.username,
      nama: session.nama,
      role_id: session.role_id,
      role_name,
    },
  });
}
