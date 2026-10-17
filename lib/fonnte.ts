// lib/fonnte.ts - Helper pengiriman WhatsApp via Fonnte API
// Docs: https://docs.fonnte.com

const FONNTE_API_URL = "https://api.fonnte.com/send";
const FONNTE_API_KEY = process.env.FONNTE_API_KEY || "";

export interface FonnteSendResult {
  ok: boolean;
  status?: string;
  raw?: unknown;
  error?: string;
}

function normalizeNumber(phone: string): string {
  // Hapus karakter non-digit, pastikan format internasional 62xxx
  let n = phone.replace(/\D/g, "");
  if (n.startsWith("0")) {
    n = "62" + n.slice(1);
  } else if (n.startsWith("8")) {
    n = "62" + n;
  }
  return n;
}

/**
 * Kirim satu pesan WhatsApp via Fonnte.
 * @param target Nomor tujuan (bisa 08xx, 62xxx, atau internasional)
 * @param message Isi pesan (mendukung \n untuk baris baru)
 */
export async function sendWhatsApp(
  target: string,
  message: string
): Promise<FonnteSendResult> {
  if (!FONNTE_API_KEY) {
    return { ok: false, error: "FONNTE_API_KEY tidak dikonfigurasi" };
  }

  const number = normalizeNumber(target);

  try {
    const res = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        Authorization: FONNTE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: number,
        message,
        countryCode: "62",
      }),
    });

    const raw = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false,
        error: (raw && (raw as { reason?: string }).reason) || `HTTP ${res.status}`,
        raw,
      };
    }

    // Fonnte mengembalikan { status: true, ... } saat sukses
    const status = raw && (raw as { status?: string }).status;
    return { ok: true, status: status || "sent", raw };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
