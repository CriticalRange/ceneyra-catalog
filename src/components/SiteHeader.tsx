import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  return (
    <header className="border-b border-black/8 dark:border-white/8 sticky top-0 z-40 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-black dark:text-white text-lg tracking-tight">
            Ceneyra
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-2 text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white rounded-lg transition-colors"
            >
              Catalog
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
