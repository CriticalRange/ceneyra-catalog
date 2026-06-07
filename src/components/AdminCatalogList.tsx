"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CatalogItem {
  id: string;
  title: string;
  description?: string | null;
  filepath: string;
  coverImage?: string | null;
  pageCount: number;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCatalogList({
  catalogs,
}: {
  catalogs: CatalogItem[];
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [settingActiveId, setSettingActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    await fetch(`/api/catalogs/${id}`, { method: "DELETE" });
    router.refresh();
    setDeletingId(null);
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    setTogglingId(id);
    await fetch(`/api/catalogs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    router.refresh();
    setTogglingId(null);
  };

  const handleSetActive = async (id: string) => {
    setSettingActiveId(id);
    await fetch(`/api/catalogs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    router.refresh();
    setSettingActiveId(null);
  };

  const startEdit = (catalog: CatalogItem) => {
    setEditingId(catalog.id);
    setEditTitle(catalog.title);
    setEditDescription(catalog.description ?? "");
  };

  const handleSaveEdit = async (id: string) => {
    await fetch(`/api/catalogs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      }),
    });
    setEditingId(null);
    router.refresh();
  };

  if (catalogs.length === 0) {
    return (
      <div className="text-center py-20 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/10 dark:border-white/10">
        <svg
          className="w-14 h-14 text-black/20 dark:text-white/20 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-black/60 dark:text-white/60 font-medium">No catalogs yet</p>
        <p className="text-black/35 dark:text-white/35 text-sm mt-1">Upload a PDF to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {catalogs.map((catalog) => (
        <div
          key={catalog.id}
          className={`bg-white dark:bg-white/[0.04] border rounded-xl p-4 flex items-start gap-4 ${
            catalog.isActive ? "border-black/25 dark:border-white/25" : "border-black/10 dark:border-white/10"
          }`}
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-14 h-20 bg-black/[0.04] dark:bg-white/[0.06] rounded-lg flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
            {catalog.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={catalog.coverImage}
                alt={catalog.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-6 h-6 text-black/25 dark:text-white/25"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {editingId === catalog.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-black border border-black/15 dark:border-white/15 text-black dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/25"
                  placeholder="Title"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 bg-white dark:bg-black border border-black/15 dark:border-white/15 text-black dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/25 resize-none"
                  placeholder="Description (optional)"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(catalog.id)}
                    disabled={!editTitle.trim()}
                    className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-xs rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-black dark:text-white text-sm truncate">
                    {catalog.title}
                  </h3>
                  {catalog.isActive && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-black text-white dark:bg-white dark:text-black">
                      Active
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      catalog.isPublished
                        ? "bg-black/[0.06] text-black/55 border border-black/10 dark:bg-white/[0.08] dark:text-white/65 dark:border-white/10"
                        : "bg-transparent text-black/35 border border-black/10 dark:text-white/35 dark:border-white/10"
                    }`}
                  >
                    {catalog.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                {catalog.description && (
                  <p className="text-black/45 dark:text-white/45 text-xs mt-0.5 line-clamp-1">
                    {catalog.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-black/35 dark:text-white/35">
                  <span>
                    {catalog.pageCount > 0 ? `${catalog.pageCount} pages` : "— pages"}
                  </span>
                  <span>
                    {new Date(catalog.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          {editingId !== catalog.id && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {!catalog.isActive && (
                <button
                  onClick={() => handleSetActive(catalog.id)}
                  disabled={settingActiveId === catalog.id}
                  className="px-2 py-1 text-xs text-black/45 hover:text-black border border-black/10 hover:border-black/25 dark:text-white/45 dark:hover:text-white dark:border-white/10 dark:hover:border-white/25 rounded-lg transition-colors disabled:opacity-40"
                  title="Set as Active"
                >
                  {settingActiveId === catalog.id ? "…" : "Set Active"}
                </button>
              )}

              <Link
                href={`/view/${catalog.id}`}
                target="_blank"
                className="p-2 text-black/35 hover:text-black dark:text-white/35 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="View"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>

              <button
                onClick={() => startEdit(catalog)}
                className="p-2 text-black/35 hover:text-black dark:text-white/35 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <button
                onClick={() => handleTogglePublish(catalog.id, catalog.isPublished)}
                disabled={togglingId === catalog.id}
                className="p-2 text-black/35 hover:text-black dark:text-white/35 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-40"
                title={catalog.isPublished ? "Unpublish" : "Publish"}
              >
                {catalog.isPublished ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => handleDelete(catalog.id, catalog.title)}
                disabled={deletingId === catalog.id}
                className="p-2 text-black/35 dark:text-white/35 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40"
                title="Delete"
              >
                {deletingId === catalog.id ? (
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
