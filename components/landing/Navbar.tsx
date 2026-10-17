import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/trips", label: "Trip" },
  { href: "/teams", label: "Tim" },
  { href: "/tips", label: "Tips" },
  { href: "/contact", label: "Kontak" },
];

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ts-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00ffd0" />
          <stop offset="1" stopColor="#00c8a4" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#ts-grad)" />
      <path
        d="M11 12h18M20 12v16"
        stroke="#0a0a0a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="11" cy="28" r="3" fill="#0a0a0a" />
    </svg>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <span className="leading-none">
            <span className="block text-sm font-black uppercase tracking-[0.2em] text-white">
              Tapak&nbsp;Swaka
            </span>
            <span className="block text-[0.55rem] font-bold uppercase tracking-[0.3em] text-[#00ffd0] mt-1">
              Holidays
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400 transition-colors hover:text-[#00ffd0]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/contact"
          className="rounded-lg bg-[#00ffd0] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#0a0a0a] transition-all hover:shadow-[0_0_20px_rgba(0,255,208,0.4)]"
        >
          Gabung Trip
        </Link>
      </nav>
    </header>
  );
}
