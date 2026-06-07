"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminNav() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <header className="bg-white border-b border-black/10 dark:bg-black dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-black dark:text-white text-sm">
              Ceneyra Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-black/45 hover:text-black dark:text-white/45 dark:hover:text-white transition-colors"
            >
              View Site ↗
            </Link>
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="px-3 py-1.5 text-xs text-black/45 hover:text-black border border-black/10 hover:border-black/25 dark:text-white/45 dark:hover:text-white dark:border-white/10 dark:hover:border-white/25 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoggingOut ? "Logging out…" : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
