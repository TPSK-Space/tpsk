import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00ffd0]">
                <span className="text-lg font-black text-[#0a0a0a]">TS</span>
              </div>
              <span className="text-sm font-black uppercase tracking-[0.2em] text-white">
                Tapak&nbsp;Swaka
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              Open trip &amp; dokumentasi perjalanan. Kami bawa kamu ke
              destinasi terbaik dengan crew yang disiplin, kalkulatif, dan
              jago nangkep momen candid.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">
              Navigasi
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/trips", label: "Open Trip" },
                { href: "/teams", label: "Tim Kami" },
                { href: "/tips", label: "Tips Perjalanan" },
                { href: "/contact", label: "Kontak" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-neutral-500 transition-colors hover:text-[#00ffd0]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">
              Hubungi Kami
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-500">
              <li>WhatsApp: +62 812-3456-7890</li>
              <li>Instagram: @tapakswaka</li>
              <li>Email: halo@tapakswaka.id</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-neutral-600">
          &copy; {new Date().getFullYear()} Tapak Swaka Holidays. Semua hak
          dilindungi.
        </div>
      </div>
    </footer>
  );
}
