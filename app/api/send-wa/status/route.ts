// app/api/send-wa/status/route.ts
// GET: status pengiriman WhatsApp PER PESERTA untuk satu trip.
// Return map participant_id -> status terakhir (PENDING | SENT | FAILED),
// beserta sent_at dan error untuk info tooltip.

import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("tapak_session")?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tripId = request.nextUrl.searchParams.get("trip_id");
  if (!tripId) {
    return NextResponse.json({ error: "trip_id wajib" }, { status: 400 });
  }

  // 1) Ambil semua participant_id pada trip ini.
  const { data: participants } = await supabaseServer
    .from("trip_participants")
    .select("id")
    .eq("trip_id", tripId);

  const participantIds = (participants || []).map((p: any) => p.id);
  if (participantIds.length === 0) {
    return NextResponse.json({ data: {} });
  }

  // 2) Ambil antrian WA untuk peserta-peserta tersebut.
  const { data: rows, error } = await supabaseServer
    .from("wa_message_queue")
    .select("participant_id, status, error, created_at, sent_at")
    .in("participant_id", participantIds)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Gagal ambil status" }, { status: 500 });
  }

  // Ambil status terakhir (latest created_at) per participant_id.
  const latestByParticipant = new Map<
    string,
    { status: string; sent_at: string | null; error: string | null }
  >();

  for (const r of (rows || []) as any[]) {
    if (!r.participant_id) continue;
    // Karena di-order ascending, yang terakhir di-loop adalah yang terbaru.
    latestByParticipant.set(r.participant_id, {
      status: r.status,
      sent_at: r.sent_at,
      error: r.error,
    });
  }

  const data: Record<string, { status: string; sent_at: string | null; error: string | null }> =
    {};
  for (const [pid, v] of latestByParticipant.entries()) {
    data[pid] = v;
  }

  return NextResponse.json({ data });
}
