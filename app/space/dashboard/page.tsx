"use client";

import { useEffect } from "react";
import BaseLayout from "@/components/space/BaseLayout";
import { apiClient } from "@/lib/apiClient";

export default function DashboardPage() {
  useEffect(() => {
    const userSapaan = document.getElementById("userSapaan");
    const userRole = document.getElementById("userRole");
    const statTotalTrips = document.getElementById("statTotalTrips");
    const statTotalPax = document.getElementById("statTotalPax");

    // Set sapaan dari session (nama user)
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.nama && userSapaan) {
          userSapaan.textContent = data.user.nama;
        }
        if (data?.user?.role_name && userRole) {
          userRole.textContent = data.user.role_name;
        }
      })
      .catch(() => {});

    // Fetch stats
    (async () => {
      const { data: trips } = await apiClient.get<any[]>("/api/trips");
      if (!trips) return;

      const totalTrips = trips.length;
      let totalPax = 0;
      for (const t of trips) totalPax += t.kapasitas_terisi || 0;

      const tripAktif = trips.find(
        (t) => t.status === "Active" || t.status === "Open"
      );

      const setText = (el: HTMLElement | null, val: string) => {
        if (!el) return;
        el.textContent = val;
        el.classList.remove("animate-pulse", "bg-[#161616]", "h-8", "w-16");
      };

      setText(statTotalTrips, String(totalTrips));
      setText(statTotalPax, String(totalPax));

      // JADWAL TRIP AKTIF (list card)
      const loadingEl = document.getElementById("loadingTrips");
      const listEl = document.getElementById("dashboardTripList");
      if (loadingEl) loadingEl.classList.add("hidden");
      if (listEl) {
        listEl.classList.remove("hidden");
        listEl.innerHTML = "";
        const upcoming = [...trips]
          .sort(
            (a, b) =>
              new Date(a.trip_date || 0).getTime() -
              new Date(b.trip_date || 0).getTime()
          )
          .slice(0, 5);

        if (upcoming.length === 0) {
          listEl.innerHTML =
            '<div class="text-center py-8 text-neutral-500 text-xs uppercase tracking-wider font-bold">Belum ada jadwal trip tersimpan.</div>';
        } else {
          upcoming.forEach((trip) => {
            const dateStr = new Date(trip.trip_date).toLocaleDateString(
              "id-ID",
              { day: "2-digit", month: "long", year: "numeric" }
            );
            const statusBadge = trip.is_lengkap
              ? '<span class="text-[0.6rem] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">Siap Berangkat</span>'
              : '<span class="text-[0.6rem] bg-[#161616] text-neutral-300 border border-[#262626] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">Draft</span>';
            const card = document.createElement("div");
            card.className =
              "flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#1f1f1f] hover:border-[#00ffd0] cursor-pointer transition-colors group";
            card.innerHTML = `
              <div class="truncate pr-2">
                <p class="text-[#00ffd0] text-sm font-bold group-hover:text-[#4dffdf] transition-colors uppercase tracking-wider truncate">${trip.name}</p>
                <p class="text-[0.65rem] text-neutral-400 mt-0.5 truncate">${trip.destination} • ${dateStr}</p>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0">
                <div class="text-right hidden md:block">
                  <p class="text-xs text-white font-bold">${trip.kapasitas_terisi || 0}/${trip.kapasitas_max} <span class="text-[0.55rem] text-neutral-500 uppercase">Pax</span></p>
                </div>
                ${statusBadge}
              </div>
            `;
            card.addEventListener("click", () => {
              window.location.href = `/trips/detail/dashboard?id=${trip.id}`;
            });
            listEl.appendChild(card);
          });
        }
      }

      // WEATHER + ETA
      const WEATHER_KEY = process.env.NEXT_PUBLIC_WEATHER_KEY || "";
      const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      const liveDest = document.getElementById("liveDest");
      const liveTemp = document.getElementById("liveTemp");
      const liveWeather = document.getElementById("liveWeather");
      const liveEta = document.getElementById("liveEta");
      const liveDist = document.getElementById("liveDist");
      const liveRouteStatus = document.getElementById("liveRouteStatus");

      if (tripAktif && liveDest) {
        const targetDest = tripAktif.destination;
        liveDest.textContent = targetDest;

        if (WEATHER_KEY && liveTemp && liveWeather) {
          try {
            const weatherRes = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                targetDest
              )}&appid=${WEATHER_KEY}&units=metric&lang=id`
            );
            const weatherData = await weatherRes.json();
            if (weatherData.main) {
              liveTemp.textContent = `${Math.round(weatherData.main.temp)}°`;
              liveWeather.textContent = weatherData.weather[0].description;
            }
          } catch (e) {}
        }

        if (MAPBOX_TOKEN && liveEta && liveDist) {
          try {
            const geoRes = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                targetDest
              )}.json?access_token=${MAPBOX_TOKEN}&country=id`
            );
            const geoData = await geoRes.json();
            if (geoData.features?.length > 0) {
              const [destLng, destLat] = geoData.features[0].center;
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                  const dirRes = await fetch(
                    `https://api.mapbox.com/directions/v5/mapbox/driving/${pos.coords.longitude},${pos.coords.latitude};${destLng},${destLat}?access_token=${MAPBOX_TOKEN}`
                  );
                  const dirData = await dirRes.json();
                  if (dirData.routes?.length > 0) {
                    const durationSec = dirData.routes[0].duration;
                    const distMeter = dirData.routes[0].distance;
                    const hours = Math.floor(durationSec / 3600);
                    const mins = Math.floor((durationSec % 3600) / 60);
                    liveEta.textContent =
                      hours > 0 ? `${hours} Jam ${mins} Mnt` : `${mins} Mnt`;
                    liveDist.textContent = `${(distMeter / 1000).toFixed(1)} KM`;
                    if (liveRouteStatus) {
                      liveRouteStatus.innerHTML =
                        '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Rute Ditemukan (Live GPS)';
                      liveRouteStatus.classList.replace(
                        "text-neutral-500",
                        "text-emerald-400"
                      );
                    }
                  }
                });
              }
            }
          } catch (e) {}
        }
      } else if (liveDest) {
        liveDest.textContent = "TIDAK ADA TRIP AKTIF";
      }
    })();
  }, []);

  return (
    <BaseLayout>
      <div className="flex items-center justify-between gap-3 mb-8 mt-2">
        <div>
          <p className="text-[0.65rem] tracking-[0.15em] text-neutral-400 uppercase">
            HALO,
          </p>
          <h1
            className="text-white font-black text-xl md:text-2xl uppercase tracking-wider"
            id="userSapaan"
          >
            TAPAKSWAKA TEAM
          </h1>
        </div>
        <div className="text-right">
          <span
            className="text-[0.6rem] tracking-[0.2em] text-[#00ffd0] font-bold uppercase bg-[#00ffd0]/10 border border-[#00ffd0]/30 px-3 py-1 rounded-full"
            id="userRole"
          >
            UNDER DEVELOPING
          </span>
        </div>
      </div>

      {/* WIDGET OPERASIONAL HARI INI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* WEATHER WIDGET */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl relative overflow-hidden flex items-center justify-between group hover:border-[#00ffd0] transition-colors">
          <div className="z-10">
            <p className="text-[0.6rem] text-neutral-400 uppercase tracking-widest mb-1">
              Cuaca Destinasi
            </p>
            <p
              id="liveDest"
              className="text-sm text-[#00ffd0] font-bold uppercase tracking-wider mb-2 truncate max-w-[180px]"
            >
              Memuat...
            </p>
            <div className="flex items-end gap-2">
              <h3
                id="liveTemp"
                className="text-3xl font-black text-white leading-none"
              >
                --°
              </h3>
              <p
                id="liveWeather"
                className="text-xs text-neutral-400 font-medium mb-1 capitalize"
              >
                --
              </p>
            </div>
          </div>
          <div className="z-10 opacity-30 group-hover:opacity-60 transition-opacity">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-14 w-14 text-[#00ffd0]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
          </div>
        </div>

        {/* MAPS ETA WIDGET */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-[#00ffd0] transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[0.6rem] text-neutral-400 uppercase tracking-widest mb-1">
                Estimasi Tiba (ETA)
              </p>
              <p id="liveEta" className="text-xl font-black text-white">
                -- Jam -- Mnt
              </p>
            </div>
            <span
              id="liveDist"
              className="text-[0.6rem] bg-[#161616] text-neutral-300 border border-[#262626] px-2 py-1 rounded font-bold uppercase tracking-widest"
            >
              -- KM
            </span>
          </div>
          <p
            id="liveRouteStatus"
            className="text-[0.6rem] text-neutral-500 uppercase tracking-widest mt-2 border-t border-[#1f1f1f] pt-3 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
            Menunggu lokasi GPS...
          </p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl">
          <p className="text-[0.6rem] text-neutral-400 uppercase tracking-widest mb-1">
            Total Trip
          </p>
          <p
            id="statTotalTrips"
            className="text-2xl md:text-3xl font-black text-white animate-pulse bg-[#161616] h-8 w-16 rounded"
          ></p>
        </div>
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl">
          <p className="text-[0.6rem] text-neutral-400 uppercase tracking-widest mb-1">
            Total Pax
          </p>
          <p
            id="statTotalPax"
            className="text-2xl md:text-3xl font-black text-[#00ffd0] animate-pulse bg-[#161616] h-8 w-16 rounded"
          ></p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <p className="text-[0.6rem] text-neutral-400 uppercase tracking-widest mb-1">
            Quick Action
          </p>
          <a
            href="/trips"
            className="mt-2 bg-[#00ffd0] hover:bg-[#00ffd0] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-xl text-center transition-colors shadow-lg shadow-[#00ffd0]/20 block"
          >
            + Buat Trip Baru
          </a>
        </div>
      </div>

      {/* JADWAL TRIP SECTION */}
      <div className="bg-[#121212] rounded-2xl border border-[#262626] shadow-xl overflow-hidden p-5 relative mb-12">
        <div className="flex justify-between items-center mb-5 border-b border-[#1f1f1f] pb-4">
          <h3 className="text-white text-xs font-bold tracking-[0.2em] uppercase text-[#00ffd0]">
            Jadwal Trip Aktif
          </h3>
          <a
            href="/trips"
            className="text-xs text-[#00ffd0] hover:text-[#4dffdf] font-bold uppercase tracking-wider"
          >
            Lihat Semua
          </a>
        </div>

        <div
          id="loadingTrips"
          className="text-center py-8 text-[#00ffd0] text-xs font-bold uppercase tracking-widest animate-pulse"
        >
          Sinkronisasi Database...
        </div>

        <div id="dashboardTripList" className="space-y-3 hidden"></div>
      </div>
    </BaseLayout>
  );
}

