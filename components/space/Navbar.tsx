"use client";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      {/* Class lebarnya disamain kayak BaseLayout biar sinkron */}
      <div className="w-full max-w-md md:max-w-3xl lg:max-w-4xl mx-auto bg-[#121212] rounded-b-3xl pt-8 pb-6 px-6 shadow-xl relative border-b border-[#1f1f1f] flex flex-col items-center justify-center">
        <img
          src="/Asset 1.png"
          alt="Tapak Swaka"
          className="h-6 object-contain mb-1"
        />
        <h2 className="text-xs tracking-[0.4em] text-[#00ffd0] font-bold mt-1">
          SPACE
        </h2>
      </div>
    </nav>
  );
}
