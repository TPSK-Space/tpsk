import { getContactInfo } from "@/lib/content";

export const metadata = {
  title: "Kontak | Tapakswaka",
  description:
    "Nanya-nanya dulu gratis — chat, DM, atau email Tapakswaka untuk info trip berikutnya.",
};

function ContactIcon({ type }: { type: "wa" | "ig" | "mail" | "pin" }) {
  const common = {
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };
  if (type === "wa")
    return (
      <svg {...common}>
        <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5Z" />
        <path d="M9 10a2.5 2.5 0 0 1 5 0c0 1-.5 1.5-1 2s-1 .5-1 1.5" />
        <path d="M12 17h.01" />
      </svg>
    );
  if (type === "ig")
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17 7h.01" />
      </svg>
    );
  if (type === "mail")
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default function ContactPage() {
  const contacts = getContactInfo();

  const channels = [
    { type: "wa" as const, label: "WhatsApp", value: contacts.whatsapp, href: "#" },
    { type: "ig" as const, label: "Instagram", value: contacts.instagram, href: "#" },
    { type: "mail" as const, label: "Email", value: contacts.email, href: `mailto:${contacts.email}` },
    { type: "pin" as const, label: "Lokasi", value: contacts.address, href: "#" },
  ];

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden landing-bg">
        <div className="absolute inset-0 grain opacity-30" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <span className="badge badge-accent">Kontak</span>
          <h1 className="mt-5 font-serif text-4xl font-black text-white sm:text-5xl">
            Nanya Dulu, Gratis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-400">
            Chat, DM, atau email — tim kami siap bantu info trip berikutnya.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Contact channels */}
          <div>
            <h2 className="font-serif text-2xl font-black text-white">
              Hubungi Kami
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Jam operasional: {contacts.hours}
            </p>

            <div className="mt-6 space-y-3">
              {channels.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#121212] p-4 transition-all hover:border-[#00ffd0]/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00ffd0]/10 text-[#00ffd0]">
                    <ContactIcon type={c.type} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      {c.label}
                    </p>
                    <p className="text-sm font-black text-white">{c.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Simple message CTA */}
          <div className="rounded-2xl border border-white/5 bg-[#121212] p-8">
            <h2 className="font-serif text-2xl font-black text-white">
              Kirim Pesan
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Cara paling cepat tetap lewat WhatsApp. Klik tombol di bawah
              untuk langsung terhubung ke admin kami.
            </p>

            <div className="mt-8 space-y-4">
              <input
                type="text"
                placeholder="Nama kamu"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-[#00ffd0]/40 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Trip yang diminati (opsional)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-[#00ffd0]/40 focus:outline-none"
              />
              <textarea
                rows={4}
                placeholder="Tulis pertanyaanmu..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-[#00ffd0]/40 focus:outline-none"
              />
              <button className="w-full rounded-xl bg-[#00ffd0] px-6 py-3.5 text-sm font-black uppercase tracking-wider text-[#0a0a0a] transition-all hover:shadow-[0_0_30px_rgba(0,255,208,0.4)]">
                Kirim via WhatsApp
              </button>
              <p className="text-center text-xs text-neutral-500">
                Pesan akan diteruskan ke WhatsApp admin kami.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

