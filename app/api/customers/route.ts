// app/api/customers/route.ts - Resolve/upsert customer (management)
import { NextRequest, NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/apiGuard";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { fullname, whatsapp_number, address } = await request.json();

  // Resolve by whatsapp_number
  const { data: existing } = await supabaseServer
    .from("customers")
    .select("id")
    .eq("whatsapp_number", whatsapp_number)
    .limit(1);

  if (existing && existing.length > 0) {
    // update address jika diberikan (untuk leader)
    if (address !== undefined) {
      await supabaseServer
        .from("customers")
        .update({ address })
        .eq("id", existing[0].id);
    }
    return NextResponse.json({ id: existing[0].id });
  }

  const { data: created, error } = await supabaseServer
    .from("customers")
    .insert([{ fullname, whatsapp_number, address: address ?? null }])
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: created.id });
}
