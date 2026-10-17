"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import BaseLayout from "./BaseLayout";
import { apiClient } from "@/lib/apiClient";

const SUB_MODULES = [
  { label: "Dashboard", path: "/trips/detail/dashboard" },
  { label: "Peserta", path: "/trips/detail/peserta" },
  { label: "Rundown", path: "/trips/detail/rundown" },
  { label: "Price Cal", path: "/trips/detail/price_cal" },
  { label: "Ledger", path: "/trips/detail/ledger" },
  { label: "Crew", path: "/trips/detail/crew" },
  { label: "Setting", path: "/trips/detail/setting" },
];

function TripDetailLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("id");

  // Fetch data global header
  useEffect(() => {
    if (!tripId) return;

    const layoutTripName = document.getElementById("layoutTripName");
    const layoutTripDest = document.getElementById("layoutTripDest");
    const layoutTripStatus = document.getElementById("layoutTripStatus");

    apiClient
      .get<{ name: string; destination: string; trip_date: string; is_lengkap: boolean }>(`/api/trips/${tripId}`)
      .then(({ data: trip }) => {
        if (!trip || !layoutTripName || !layoutTripDest || !layoutTripStatus)
          return;

        layoutTripName.textContent = trip.name;
        const dateString = new Date(trip.trip_date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        layoutTripDest.textContent = `${trip.destination} • ${dateString}`;
        layoutTripStatus.textContent = trip.is_lengkap
          ? "Siap Berangkat"
          : "Draft Incomplete";
        if (trip.is_lengkap)
          layoutTripStatus.classList.replace(
            "text-[#00ffd0]",
            "text-emerald-400"
          );
      });
  }, [tripId]);

  return (
    <BaseLayout>
      {/* Header Trip */}
      <div className="mb-4 mt-2">
        <a
          href="/trips"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00ffd0] hover:text-[#4dffdf] transition-colors mb-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Kembali ke Trips
        </a>
        <div className="flex items-start justify-between">
          <div>
            <h1
              id="layoutTripName"
              className="text-2xl md:text-3xl font-serif text-white font-bold leading-tight"
            >
              Memuat Data...
            </h1>
            <p
              id="layoutTripDest"
              className="text-xs text-neutral-400 mt-1 uppercase tracking-widest"
            >
              -
            </p>
          </div>
          <span
            id="layoutTripStatus"
            className="text-[0.65rem] bg-[#161616] text-[#00ffd0] border border-[#00ffd0]/30 px-3 py-1 rounded-full uppercase tracking-widest font-bold"
          >
            ...
          </span>
        </div>
      </div>

      {/* SUB NAVBAR 7 MODUL */}
      <div className="border-b border-[#1f1f1f] mb-6 overflow-x-auto no-scrollbar">
        <div className="flex space-x-2 min-w-max pb-2" id="detailSubNav">
          {SUB_MODULES.map((mod) => {
            const isActive = pathname === mod.path;
            return (
              <a
                key={mod.path}
                href={`${mod.path}?id=${tripId ?? ""}`}
                className={
                  isActive
                    ? "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all bg-[#00ffd0] text-[#0a0a0a] shadow-glow"
                    : "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-neutral-400 hover:text-white hover:bg-[#1e1e1e]"
                }
              >
                {mod.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* AREA KONTEN UNTUK HALAMAN SPESIFIK */}
      <div className="pb-12">{children}</div>
    </BaseLayout>
  );
}

export default function TripDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#00ffd0] text-xs uppercase tracking-widest animate-pulse">
          Memuat...
        </div>
      }
    >
      <TripDetailLayoutInner>{children}</TripDetailLayoutInner>
    </Suspense>
  );
}
