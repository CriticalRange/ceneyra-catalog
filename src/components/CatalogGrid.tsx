"use client";

import dynamic from "next/dynamic";

const CatalogCard = dynamic(() => import("./CatalogCard"), { ssr: false });

interface CatalogItem {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  coverImage?: string | null;
  filepath: string;
  pageCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function CatalogGrid({ catalogs }: { catalogs: CatalogItem[] }) {
  if (catalogs.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-black/30 dark:text-white/30 text-lg">No catalogs yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {catalogs.map((catalog) => (
        <CatalogCard key={catalog.id} {...catalog} />
      ))}
    </div>
  );
}
