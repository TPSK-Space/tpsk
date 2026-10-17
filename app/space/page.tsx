"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, passcode }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Kredensial tidak valid!");
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm px-6">
      <div className="text-center mb-10">
        <img
          src="/Asset 1.png"
          alt="Tapak Swaka"
          className="h-8 object-contain mx-auto mb-2"
        />
        <h2 className="text-xs tracking-[0.4em] text-[#00ffd0] font-bold mt-1 uppercase">
          Space Portal
        </h2>
      </div>

      <div className="bg-[#121212] rounded-2xl border border-[#1f1f1f] p-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label className="block text-[0.65rem] text-neutral-400 uppercase tracking-wider mb-2">
              Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
              className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white text-sm focus:border-[#00ffd0] focus:outline-none transition-colors"
              placeholder="••••••"
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center uppercase tracking-wider font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00ffd0] hover:bg-[#00ffd0] text-[#0a0a0a] py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors active:scale-95 shadow-lg shadow-[#00ffd0]/20 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "MENGOTENTIKASI..." : "Masuk"}
          </button>
        </form>
      </div>

      <p className="text-center text-[0.6rem] text-neutral-500 mt-8 tracking-widest uppercase">
        Internal Access Only
      </p>
    </div>
  );
}
