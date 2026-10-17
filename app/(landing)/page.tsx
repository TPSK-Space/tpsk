import Link from "next/link";
import { getWhyUs, getTestimonials, getFaqs, getMediaGallery } from "@/lib/content";
import { getAvailableTrips } from "@/lib/trips";

// ============================================================
// ICONS
// ============================================================
function WhyUsIcon({ icon }: { icon: "compass" | "shield" | "sun" | "friends" }) {
  const common = {
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };
  if (icon === "compass")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
      </svg>
    );
  if (icon === "shield")
    return (
      <svg {...common}>
        <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  if (icon === "sun")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2" />
      <path d="M15 20c0-2.3 1.7-4.2 4-4.7" />
    </svg>
  );
}

function MediaIcon({ type }: { type: "photo" | "video" }) {
  const common = {
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };
  if (type === "video")
    return (
      <svg {...common}>
        <rect x="3" y="5" width="13" height="14" rx="2" />
        <path d="m16 10 5-3v10l-5-3" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 15-4-4-4 4-2-2" />
    </svg>
  );
}

// ============================================================
// SECTIONS
// ============================================================
function Hero() {
  return (
    <section className="relative overflow-hidden landing-bg">
      <div className="absolute inset-0 grain opacity-30" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
        <span className="badge badge-accent animate-pulse-glow">
          Open Trip &amp; Dokumentasi Perjalanan
        </span>
        <h1 className="mt-6 font-serif text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
          Jelajah Alam,
          <br />
          <span className="bg-gradient-to-r from-[#00ffd0] to-[#10b981] bg-clip-text text-transparent">
            Bawa Pulang Cerita.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">
          Tapak Swaka Holidays bawa kamu ke puncak-puncak terbaik Indonesia —
          dengan crew disiplin, budget transparan, dan dokumentasi candid
          sekelas film.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/trips"
            className="rounded-xl bg-[#00ffd0] px-7 py-3.5 text-sm font-black uppercase tracking-wider text-[#0a0a0a] transition-all hover:shadow-[0_0_30px_rgba(0,255,208,0.45)]"
          >
            Lihat Open Trip
          </Link>
          <Link
            href="/teams"
            className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white transition-colors hover:border-[#00ffd0]/40"
          >
            Kenalan Sama Tim
          </Link>
        </div>
      </div>
    </section>
  );
}

function WhyUs({ items }: { items: ReturnType<typeof getWhyUs> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <span className="badge badge-emerald">Kenapa Tapak Swaka?</span>
        <h2 className="mt-5 font-serif text-3xl font-black text-white sm:text-4xl">
          Bukan Sekadar Jalan-Jalan
        </h2>
        <p className="mt-3 text-neutral-400">
          Kami urus semua detail, kamu fokus nikmatin perjalanan.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="group rounded-2xl border border-white/5 bg-[#121212] p-6 transition-all hover:border-[#00ffd0]/30 hover:shadow-glow"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00ffd0]/10 text-[#00ffd0]">
              <WhyUsIcon icon={item.icon} />
            </div>
            <h3 className="mt-5 text-base font-black text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AvailableTrips({ trips }: { trips: ReturnType<typeof getAvailableTrips> }) {
  return (
    <section className="border-y border-white/5 bg-[#0d0d0d]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="badge badge-accent">Open Trip</span>
            <h2 className="mt-5 font-serif text-3xl font-black text-white sm:text-4xl">
              Jadwal Terdekat
            </h2>
            <p className="mt-3 text-neutral-400">
              Kursi terbatas, amankan tempatmu sekarang.
            </p>
          </div>
          <Link
            href="/trips"
            className="text-sm font-bold uppercase tracking-wider text-[#00ffd0] hover:underline"
          >
            Lihat Semua &rarr;
          </Link>
        </div>

        {trips.length === 0 ? (
          <p className="mt-10 text-neutral-500">
            Belum ada trip yang dibuka. Cek lagi nanti ya!
          </p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {trips.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                className="group overflow-hidden rounded-2xl border border-white/5 bg-[#121212] transition-all hover:border-[#00ffd0]/30 hover:shadow-glow"
              >
                <div className="relative h-40 overflow-hidden topo">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl opacity-20">⛰️</span>
                  </div>
                  <span className="absolute left-4 top-4">
                    <span
                      className={`badge ${
                        trip.status === "full" ? "badge-amber" : "badge-accent"
                      }`}
                    >
                      {trip.status === "open"
                        ? "Tersedia"
                        : trip.status === "full"
                          ? "Penuh"
                          : "Tutup"}
                    </span>
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-black text-white">
                    {trip.name}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-400">
                    {trip.destination} &middot; {trip.duration}
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-neutral-500">Mulai dari</p>
                      <p className="text-2xl font-black text-[#00ffd0]">
                        {trip.price}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-500">{trip.capacity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Testimonials({
  testimonials,
}: {
  testimonials: ReturnType<typeof getTestimonials>;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <span className="badge badge-amber">Kata Mereka</span>
        <h2 className="mt-5 font-serif text-3xl font-black text-white sm:text-4xl">
          Cerita dari Peserta
        </h2>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="rounded-2xl border border-white/5 bg-[#121212] p-6"
          >
            <div className="text-2xl text-[#00ffd0]">&ldquo;</div>
            <blockquote className="mt-2 text-sm leading-relaxed text-neutral-300">
              {t.quote}
            </blockquote>
            <figcaption className="mt-5 border-t border-white/5 pt-4">
              <p className="text-sm font-black text-white">{t.name}</p>
              <p className="text-xs text-neutral-500">{t.trip}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function OurFamily({ media }: { media: ReturnType<typeof getMediaGallery> }) {
  return (
    <section className="border-y border-white/5 bg-[#0d0d0d]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <span className="badge badge-emerald">Galeri</span>
          <h2 className="mt-5 font-serif text-3xl font-black text-white sm:text-4xl">
            Momen Keluarga Kami
          </h2>
          <p className="mt-3 text-neutral-400">
            Hasil dokumentasi candid dari setiap perjalanan.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
          {media.map((m, i) => (
            <div
              key={i}
              className="group relative flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-[#121212] transition-all hover:border-[#00ffd0]/30"
            >
              <div className="text-[#00ffd0] opacity-70">
                <MediaIcon type={m.type} />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-white">{m.label}</p>
                <p className="text-xs text-neutral-500">{m.trip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ({ faqs }: { faqs: ReturnType<typeof getFaqs> }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <span className="badge badge-accent">FAQ</span>
        <h2 className="mt-5 font-serif text-3xl font-black text-white sm:text-4xl">
          Sering Ditanyakan
        </h2>
      </div>

      <div className="mt-10 space-y-3">
        {faqs.map((f) => (
          <details
            key={f.question}
            className="group rounded-2xl border border-white/5 bg-[#121212] p-5"
          >
            <summary className="flex cursor-pointer items-center justify-between text-sm font-black text-white">
              {f.question}
              <span className="text-[#00ffd0] transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              {f.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const trips = getAvailableTrips();
  const whyUs = getWhyUs();
  const testimonials = getTestimonials();
  const faqs = getFaqs();
  const media = getMediaGallery();

  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <WhyUs items={whyUs} />
      <AvailableTrips trips={trips} />
      <Testimonials testimonials={testimonials} />
      <OurFamily media={media} />
      <FAQ faqs={faqs} />
    </main>
  );
}


