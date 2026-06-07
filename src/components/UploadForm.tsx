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
  const [isCoverDragging, setIsCoverDragging] = useState(false);
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
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleCoverDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsCoverDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
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
        const text = await res.text();
        let message = "Upload failed";
        try { message = JSON.parse(text)?.error || message; } catch {}
        throw new Error(message);
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
      className="bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl p-6 space-y-5"
    >
      {/* PDF Upload */}
      <div>
        <label className="block text-sm font-medium text-black/70 dark:text-white/70 mb-2">
          PDF File <span className="text-red-400">*</span>
        </label>
        <div
          onClick={() => pdfInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            pdfFile
              ? "border-black/30 bg-black/[0.03] dark:border-white/30 dark:bg-white/[0.06]"
              : isDragging
              ? "border-black/35 bg-black/[0.04] dark:border-white/35 dark:bg-white/[0.08]"
              : "border-black/15 hover:border-black/25 dark:border-white/15 dark:hover:border-white/25"
          }`}
        >
          {pdfFile ? (
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-8 h-8 text-black/45 dark:text-white/45"
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
                <p className="text-sm font-medium text-black dark:text-white">{pdfFile.name}</p>
                <p className="text-xs text-black/45 dark:text-white/45">
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
                className="ml-2 text-black/35 hover:text-red-600 dark:text-white/35 dark:hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <svg
                className="w-10 h-10 text-black/25 dark:text-white/25 mx-auto mb-3"
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
              <p className="text-sm text-black/50 dark:text-white/50">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-black/35 dark:text-white/35 mt-1">PDF up to 50 MB</p>
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
          className="block text-sm font-medium text-black/70 dark:text-white/70 mb-2"
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
          className="w-full px-4 py-2.5 bg-white dark:bg-black border border-black/15 dark:border-white/15 text-black dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/25 text-sm placeholder:text-black/30 dark:placeholder:text-white/30"
          placeholder="e.g. Spring Collection 2025"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-black/70 dark:text-white/70 mb-2"
        >
          Description{" "}
          <span className="text-black/35 dark:text-white/35 font-normal">(optional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full px-4 py-2.5 bg-white dark:bg-black border border-black/15 dark:border-white/15 text-black dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/25 text-sm placeholder:text-black/30 dark:placeholder:text-white/30 resize-none"
          placeholder="A short description of this catalog"
        />
      </div>

      {/* Cover image */}
      <div>
        <label className="block text-sm font-medium text-black/70 dark:text-white/70 mb-2">
          Cover Image{" "}
          <span className="text-black/35 dark:text-white/35 font-normal">
            (optional — auto-generated from PDF if not provided)
          </span>
        </label>
        <div className="flex flex-col items-start gap-2">
          <div
            onClick={() => coverInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsCoverDragging(true); }}
            onDragLeave={() => setIsCoverDragging(false)}
            onDrop={handleCoverDrop}
            className={`w-24 h-32 border-2 border-dashed rounded-xl overflow-hidden cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-colors ${
              coverPreview
                ? "border-black/30 dark:border-white/30"
                : isCoverDragging
                ? "border-black/35 bg-black/[0.04] dark:border-white/35 dark:bg-white/[0.08]"
                : "border-black/15 hover:border-black/25 dark:border-white/15 dark:hover:border-white/25"
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
              <>
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-[10px] text-black/30 dark:text-white/30 text-center leading-tight px-1">
                  JPG, PNG, WebP
                </span>
              </>
            )}
          </div>
          {coverPreview && (
            <button
              type="button"
              onClick={() => {
                setCoverFile(null);
                setCoverPreview(null);
                if (coverInputRef.current) coverInputRef.current.value = "";
              }}
              className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              Remove
            </button>
          )}
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
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl px-4 py-3">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Progress bar */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-black/45 dark:text-white/45">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white rounded-full transition-all duration-200"
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
          className="flex-1 py-2.5 text-white font-semibold rounded-xl transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
          style={{ background: "#172c4f" }}
        >
          {isUploading ? "Uploading…" : "Upload Catalog"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          disabled={isUploading}
          className="px-5 py-2.5 text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer text-sm border border-black/10 hover:border-black/25 dark:border-white/10 dark:hover:border-white/25"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
