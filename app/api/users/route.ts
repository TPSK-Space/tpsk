// app/api/users/route.ts - List management users (untuk assign TL / dokumentasi)
import { NextRequest, NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/apiGuard";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { data, error } = await supabaseServer
    .from("users")
    .select("id, nama, username, whatsapp_number, role_id(name)")
    .order("nama", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
