import { getAvailableTrips } from "@/lib/trips";

export const metadata = {
  title: "Trip | Tapakswaka",
  description:
    "Semua open trip Tapakswaka yang lagi dibuka — lengkap dengan harga, jadwal, dan fasilitas.",
};

function TripCard({ trip }: { trip: ReturnType<typeof getAvailableTrips>[number] }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/5 bg-[#121212] transition-all hover:border-[#00ffd0]/30 hover:shadow-glow">
      <div className="relative h-48 overflow-hidden topo">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl opacity-20">⛰️</span>
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-black text-white">
              {trip.name}
            </h3>
            <p className="mt-1 text-sm text-neutral-400">
              {trip.destination} &middot; {trip.duration}
            </p>
          </div>
          <p className="shrink-0 text-xs font-bold text-neutral-500">
            {trip.date}
          </p>
        </div>

        {trip.highlight && (
          <p className="mt-3 text-sm text-neutral-300">
            <span className="font-bold text-[#00ffd0]">Highlight:</span>{" "}
            {trip.highlight}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {trip.facilities.map((f) => (
            <span
              key={f}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-400"
            >
              {f}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-end justify-between border-t border-white/5 pt-4">
          <div>
            <p className="text-xs text-neutral-500">Mulai dari</p>
            <p className="text-2xl font-black text-[#00ffd0]">{trip.price}</p>
            {trip.priceNote && (
              <p className="text-xs text-neutral-500">{trip.priceNote}</p>
            )}
          </div>
          <p className="text-xs text-neutral-500">{trip.capacity}</p>
        </div>
      </div>
    </div>
  );
}

export default function TripsPage() {
  const trips = getAvailableTrips();

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden landing-bg">
        <div className="absolute inset-0 grain opacity-30" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <span className="badge badge-accent">Open Trip</span>
          <h1 className="mt-5 font-serif text-4xl font-black text-white sm:text-5xl">
            Pilih Petualanganmu
          </h1>
          <p className="mt-4 text-neutral-400">
            Semua trip lengkap dengan harga, jadwal, dan fasilitas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {trips.length === 0 ? (
          <p className="text-center text-neutral-500">
            Belum ada trip yang dibuka. Cek lagi nanti ya!
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

