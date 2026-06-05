"use client";

import Link from "next/link";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface CatalogCardProps {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  coverImage?: string | null;
  filepath?: string;
  pageCount: number;
  createdAt: string;
}

export default function CatalogCard({
  title,
  description,
  slug,
  coverImage,
  filepath,
  pageCount,
  createdAt,
}: CatalogCardProps) {
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/catalog/${slug}`} className="group block">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : filepath && !pdfError ? (
            <div className="w-full h-full flex items-center justify-center">
              <Document
                file={filepath}
                onLoadSuccess={() => setPdfLoaded(true)}
                onLoadError={() => setPdfError(true)}
                loading={<PDFPlaceholder title={title} />}
              >
                {pdfLoaded && (
                  <Page
                    pageNumber={1}
                    width={260}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </Document>
            </div>
          ) : (
            <PDFPlaceholder title={title} />
          )}

          {/* Page count badge */}
          {pageCount > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              {pageCount} pages
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">
              {description}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-400">{formattedDate}</p>
        </div>
      </div>
    </Link>
  );
}

function PDFPlaceholder({ title }: { title: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 p-6">
      <svg
        className="w-16 h-16 text-indigo-300 mb-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <span className="text-xs text-slate-400 text-center line-clamp-2">
        {title}
      </span>
    </div>
  );
}
