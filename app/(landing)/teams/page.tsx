import { getTeams } from "@/lib/content";

export const metadata = {
  title: "The Clowns | Tapakswaka",
  description:
    "Kenali THE CLOWNS — tim anomali Tapakswaka yang kelihatan kayak pelawak, tapi soal eksekusi trip layaknya tactical strike team.",
};

function TeamIcon({ icon }: { icon: "clock" | "calc" | "video" | "photo" }) {
  const common = {
    className: "h-8 w-8",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };
  if (icon === "clock")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  if (icon === "calc")
    return (
      <svg {...common}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
      </svg>
    );
  if (icon === "video")
    return (
      <svg {...common}>
        <path d="M3 5l6 6 3-3 6-6" />
        <path d="M3 19l6-6 3 3 6 6" />
        <circle cx="12" cy="12" r="2" />
        <path d="M9 9l-1.5 1.5M15 9l1.5 1.5M9 15l-1.5-1.5M15 15l1.5-1.5" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M4 8h3l2-2h6l2 2h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export default function TeamsPage() {
  const teams = getTeams();

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden landing-bg">
        <div className="absolute inset-0 grain opacity-30" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <span className="badge badge-accent">The Clowns</span>
          <h1 className="mt-5 font-serif text-4xl font-black text-white sm:text-5xl">
            Tim di Balik Layar
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-400">
            Kelihatan kayak pelawak, tapi soal eksekusi trip layaknya tactical
            strike team. Kenalan dulu.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {teams.map((member) => (
            <div
              key={member.name}
              className="group rounded-2xl border border-white/5 bg-[#121212] p-6 transition-all hover:border-[#00ffd0]/30 hover:shadow-glow sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#00ffd0]/10 text-[#00ffd0] transition-colors group-hover:bg-[#00ffd0] group-hover:text-[#0a0a0a]">
                  <TeamIcon icon={member.icon} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif text-xl font-black text-white">
                    {member.name}
                  </h2>
                  <p className="text-sm font-bold text-[#00ffd0]">
                    &ldquo;{member.nickname}&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {member.role} &middot; {member.division}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-neutral-400">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

