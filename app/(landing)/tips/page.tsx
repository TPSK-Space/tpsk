import { getTips } from "@/lib/content";

export const metadata = {
  title: "Tips & Trik | Tapakswaka",
  description:
    "Bekal sebelum berangkat — tips packing, budgeting, dan survival dari traveler yang udah duluan jalan.",
};

function TipIcon({ icon }: { icon: "bag" | "health" | "doc" | "energy" }) {
  const common = {
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };
  if (icon === "bag")
    return (
      <svg {...common}>
        <path d="M6 7h12l1 13H5L6 7Z" />
        <path d="M9 10V6a3 3 0 0 1 6 0v4" />
      </svg>
    );
  if (icon === "health")
    return (
      <svg {...common}>
        <path d="M12 21C7 17 4 14 4 10a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 4-3 7-8 11Z" />
      </svg>
    );
  if (icon === "doc")
    return (
      <svg {...common}>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v4h4M9 12h6M9 16h6" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

export default function TipsPage() {
  const tips = getTips();

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden landing-bg">
        <div className="absolute inset-0 grain opacity-30" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <span className="badge badge-emerald">Tips &amp; Trik</span>
          <h1 className="mt-5 font-serif text-4xl font-black text-white sm:text-5xl">
            Bekal Sebelum Berangkat
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-400">
            Dari traveler yang udah duluan jalan — biar trip kamu mulus dari
            titik kumpul sampai puncak.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {tips.map((tip) => (
            <div
              key={tip.title}
              className="group rounded-2xl border border-white/5 bg-[#121212] p-6 transition-all hover:border-[#00ffd0]/30 hover:shadow-glow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00ffd0]/10 text-[#00ffd0]">
                <TipIcon icon={tip.icon} />
              </div>
              <h2 className="mt-5 text-base font-black text-white">
                {tip.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

