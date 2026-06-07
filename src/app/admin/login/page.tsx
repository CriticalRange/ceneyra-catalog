"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Incorrect password. Please try again.");
        setPassword("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-white dark:text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Admin Login</h1>
          <p className="text-black/45 dark:text-white/45 text-sm mt-1">Ceneyra Catalog</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 border border-black/10 dark:border-white/10"
        >
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black dark:text-white mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white placeholder-black/30 dark:placeholder-white/30 text-sm"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full py-2.5 text-white font-semibold rounded-xl transition-colors hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-sm"
            style={{ background: "#172c4f" }}
          >
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
