// app/api/send-wa/process/route.ts
// Worker: memproses antrian wa_message_queue (status PENDING).
// Dipanggil oleh client via polling, atau cron eksternal.
// Anti-spam: delay 4-6 detik acak antar pesan agar tidak dianggap spam/block.

import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";
import { sendWhatsApp } from "@/lib/fonnte";

const MIN_DELAY_MS = 4000;
const MAX_DELAY_MS = 6000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("tapak_session")?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ambil batch pesan PENDING (maks 20 per proses agar tidak timeout)
  const { data: pending, error } = await supabaseServer
    .from("wa_message_queue")
    .select("*")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "Gagal ambil antrian" }, { status: 500 });
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ processed: 0, remaining: 0 });
  }

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i++) {
    const job = pending[i];

    const result = await sendWhatsApp(job.whatsapp_number, job.message);

    if (result.ok) {
      await supabaseServer
        .from("wa_message_queue")
        .update({ status: "SENT", sent_at: new Date().toISOString() })
        .eq("id", job.id);
      sent++;
    } else {
      const attempts = (job.attempts || 0) + 1;
      await supabaseServer
        .from("wa_message_queue")
        .update({
          status: "FAILED",
          error: result.error,
          attempts,
        })
        .eq("id", job.id);
      failed++;
    }

    // Delay anti-spam antar pesan (kecuali pesan terakhir)
    if (i < pending.length - 1) {
      const delay =
        MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
      await sleep(delay);
    }
  }

  // Cek sisa antrian
  const { count: remaining } = await supabaseServer
    .from("wa_message_queue")
    .select("id", { count: "exact", head: true })
    .eq("status", "PENDING");

  return NextResponse.json({
    processed: pending.length,
    sent,
    failed,
    remaining: remaining || 0,
  });
}
