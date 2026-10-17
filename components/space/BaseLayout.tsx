"use client";

// components/BaseLayout.tsx - Layout utama
// Desktop (lg+): sidebar kiri (accordion) + konten full-width
// Mobile: top bar + bottom nav
// Auth guard ditangani middleware.ts (server-side).

import { useState } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-neutral-100">
      {/* Sidebar (desktop) */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top bar (mobile) */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 h-14 border-b border-[#1f1f1f] bg-[#0a0a0a]/90 backdrop-blur">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-neutral-300 hover:text-[#00ffd0]"
          aria-label="Buka menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="text-sm font-bold tracking-wider text-white">
          TAPAK SWAKA
        </span>
        <span className="text-[0.6rem] tracking-[0.35em] text-[#00ffd0] font-bold">
          SPACE
        </span>
      </header>

      {/* Konten utama */}
      <div className="lg:pl-72">
        <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 pt-6 pb-32 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <BottomNav />
    </div>
  );
}

