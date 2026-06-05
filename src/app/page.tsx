import { prisma } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import CatalogCard from "@/components/CatalogCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const catalogs = await prisma.catalog.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
              Digital Catalogs
            </h1>
            <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
              Browse our collection of interactive flipbook catalogs. Click any
              cover to open and flip through the pages.
            </p>
          </div>
        </section>

        {/* Catalog grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {catalogs.length === 0 ? (
            <div className="text-center py-24">
              <svg
                className="w-16 h-16 text-slate-300 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="text-slate-400 text-lg font-medium">
                No catalogs yet
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Check back soon for new publications.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {catalogs.map((catalog) => (
                <CatalogCard
                  key={catalog.id}
                  id={catalog.id}
                  title={catalog.title}
                  description={catalog.description}
                  slug={catalog.slug}
                  coverImage={catalog.coverImage}
                  filepath={catalog.filepath}
                  pageCount={catalog.pageCount}
                  createdAt={catalog.createdAt.toISOString()}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Ceneyra Catalog. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
