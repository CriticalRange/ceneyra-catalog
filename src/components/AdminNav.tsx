"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Catalogs" },
    { href: "/admin/upload", label: "Upload New" },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-white text-sm tracking-wider uppercase">
              Ceneyra Admin
            </span>
            <nav className="flex gap-1">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    pathname === href
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              View Site ↗
            </Link>
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? "Logging out…" : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
