"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("PDF must be under 50 MB.");
      return;
    }
    setError("");
    setPdfFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("PDF must be under 50 MB.");
      return;
    }
    setError("");
    setPdfFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));
    }
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pdfFile || !title.trim()) return;

    setIsUploading(true);
    setProgress(10);
    setError("");

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("title", title.trim());
    if (description.trim()) formData.append("description", description.trim());
    if (coverFile) formData.append("cover", coverFile);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 5, 85));
      }, 200);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
    >
      {/* PDF Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          PDF File <span className="text-red-400">*</span>
        </label>
        <div
          onClick={() => pdfInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            pdfFile
              ? "border-indigo-500/50 bg-indigo-900/10"
              : isDragging
              ? "border-indigo-500 bg-indigo-900/20"
              : "border-slate-700 hover:border-slate-600"
          }`}
        >
          {pdfFile ? (
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-8 h-8 text-indigo-400"
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
              <div className="text-left">
                <p className="text-sm font-medium text-white">{pdfFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(pdfFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setPdfFile(null);
                  if (pdfInputRef.current) pdfInputRef.current.value = "";
                }}
                className="ml-2 text-slate-500 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <svg
                className="w-10 h-10 text-slate-600 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-slate-400">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-slate-600 mt-1">PDF up to 50 MB</p>
            </>
          )}
        </div>
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handlePdfChange}
          className="hidden"
        />
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Title <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm placeholder-slate-500"
          placeholder="e.g. Spring Collection 2025"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Description{" "}
          <span className="text-slate-600 font-normal">(optional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm placeholder-slate-500 resize-none"
          placeholder="A short description of this catalog"
        />
      </div>

      {/* Cover image */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Cover Image{" "}
          <span className="text-slate-600 font-normal">
            (optional — auto-generated from PDF if not provided)
          </span>
        </label>
        <div className="flex items-start gap-4">
          <div
            onClick={() => coverInputRef.current?.click()}
            className={`flex-shrink-0 w-24 h-32 border-2 border-dashed rounded-xl overflow-hidden cursor-pointer flex items-center justify-center transition-colors ${
              coverPreview
                ? "border-indigo-500/50"
                : "border-slate-700 hover:border-slate-600"
            }`}
          >
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
          <div className="flex-1 text-xs text-slate-500 mt-2">
            <p>JPG, PNG, or WebP</p>
            {coverFile && (
              <p className="mt-1 text-slate-400">{coverFile.name}</p>
            )}
            {coverPreview && (
              <button
                type="button"
                onClick={() => {
                  setCoverFile(null);
                  setCoverPreview(null);
                  if (coverInputRef.current) coverInputRef.current.value = "";
                }}
                className="mt-2 text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverChange}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Progress bar */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isUploading || !pdfFile || !title.trim()}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isUploading ? "Uploading…" : "Upload Catalog"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          disabled={isUploading}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors disabled:opacity-50 text-sm border border-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
