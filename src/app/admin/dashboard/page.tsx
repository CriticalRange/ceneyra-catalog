import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import AdminNav from "@/components/AdminNav";
import AdminCatalogList from "@/components/AdminCatalogList";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session.isAdmin) {
    redirect("/admin/login");
  }

  const catalogs = await prisma.catalog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Catalogs</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {catalogs.length} total &mdash;{" "}
              {catalogs.filter((c) => c.isPublished).length} published
            </p>
          </div>
          <a
            href="/admin/upload"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            + Upload New
          </a>
        </div>

        <AdminCatalogList
          catalogs={catalogs.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            slug: c.slug,
            filepath: c.filepath,
            coverImage: c.coverImage,
            pageCount: c.pageCount,
            isPublished: c.isPublished,
            createdAt: c.createdAt.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
