"use client";

// components/Sidebar.tsx - Sidebar kiri (desktop lg+) dengan accordion menu
// Mobile: ditampilkan sebagai drawer.

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

interface UserInfo {
  username: string;
  nama: string | null;
  role_name: string | null;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const icon = (path: string) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const NAV: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: icon(
      "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"
    ),
  },
  {
    label: "Trips",
    path: "/trips",
    icon: icon(
      "M3 21v-4m0 0V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H3z"
    ),
  },
  {
    label: "Registrasi",
    path: "/registrasi",
    icon: icon(
      "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    ),
  },
  {
    label: "Tiket",
    path: "/ticket",
    icon: icon(
      "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
    ),
  },
  {
    label: "Pengaturan",
    path: "/settings",
    icon: icon(
      "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
    ),
  },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    apiClient
      .get<{ user: UserInfo }>("/api/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
      // ignore
    }
    router.push("/");
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const brand = (
    <div className="flex items-center gap-3 px-2">
      <div className="h-10 w-10 rounded-xl bg-[#00ffd0]/10 border border-[#00ffd0]/30 flex items-center justify-center shadow-glow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-[#00ffd0]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold tracking-wider text-white leading-none">
          TAPAK SWAKA
        </p>
        <p className="text-[0.6rem] tracking-[0.35em] text-[#00ffd0] font-bold mt-1">
          SPACE
        </p>
      </div>
    </div>
  );

  const menuContent = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(item.path);
        return (
          <a
            key={item.path}
            href={item.path}
            className={`nav-item ${active ? "nav-item-active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );

  const userCard = (
    <div className="border-t border-[#1f1f1f] pt-4 mt-auto">
      <div className="flex items-center gap-3 px-2 mb-3">
        <div className="h-9 w-9 rounded-full bg-[#161616] border border-[#262626] flex items-center justify-center text-[#00ffd0] text-sm font-bold">
          {(user?.nama?.[0] || user?.username?.[0] || "?").toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {user?.nama || user?.username || "..."}
          </p>
          <p className="text-[0.6rem] uppercase tracking-widest text-neutral-500">
            {user?.role_name || "-"}
          </p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="nav-item text-[#f87171] hover:text-[#f87171] hover:bg-[#f87171]/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span>Keluar</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Sidebar desktop (fixed) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 flex-col border-r border-[#1f1f1f] bg-[#0d0d0d] p-5">
        <div className="mb-8">{brand}</div>
        <div className="flex-1 overflow-y-auto">{menuContent}</div>
        {userCard}
      </aside>

      {/* Drawer mobile */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      >
        <div
          className={`absolute inset-0 bg-black/70 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 bg-[#0d0d0d] border-r border-[#1f1f1f] p-5 flex flex-col transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            {brand}
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-white"
              aria-label="Tutup menu"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{menuContent}</div>
          {userCard}
        </aside>
      </div>
    </>
  );
}

