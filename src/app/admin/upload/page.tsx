import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AdminNav from "@/components/AdminNav";
import UploadForm from "@/components/UploadForm";

export const dynamic = "force-dynamic";

export default async function AdminUploadPage() {
  const session = await getSession();
  if (!session.isAdmin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Upload New Catalog</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload a PDF file to create a new flipbook catalog.
          </p>
        </div>

        <UploadForm />
      </main>
    </div>
  );
}
