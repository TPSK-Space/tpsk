// app/api/trips/[id]/crews/route.ts - Crew list per trip (management)
import { NextRequest, NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/apiGuard";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { id } = await params;
  const { data, error } = await supabaseServer
    .from("trip_crews")
    .select("id, role, user_id(id, nama, username, whatsapp_number)")
    .eq("trip_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { id } = await params;
  const { user_id, role } = await request.json();
  if (!user_id || !role)
    return NextResponse.json({ error: "user_id dan role wajib" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("trip_crews")
    .insert([{ trip_id: id, user_id, role }])
    .select("id, role, user_id(id, nama, username, whatsapp_number)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) return unauthorized();

  const { id } = await params;
  const { crew_id } = await request.json();
  if (!crew_id)
    return NextResponse.json({ error: "crew_id wajib" }, { status: 400 });

  const { error } = await supabaseServer
    .from("trip_crews")
    .delete()
    .eq("id", crew_id)
    .eq("trip_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
