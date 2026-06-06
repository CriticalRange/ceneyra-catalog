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
  isActive: boolean;
  createdAt: string;
}

export default function CatalogCard({
  title,
  description,
  slug,
  coverImage,
  filepath,
  pageCount,
  isActive,
  createdAt,
}: CatalogCardProps) {
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const href = isActive ? "/view" : `/catalog/${slug}`;

  return (
    <Link href={href} className="group block">
      <div className="bg-white dark:bg-white/5 rounded-xl border border-black/8 dark:border-white/8 overflow-hidden transition-all duration-200 group-hover:border-black/20 dark:group-hover:border-white/20 group-hover:-translate-y-0.5">
        {/* Thumbnail */}
        <div className="relative aspect-[3/4] bg-black/4 dark:bg-white/4 overflow-hidden">
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

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isActive && (
              <span className="bg-black dark:bg-white text-white dark:text-black text-xs font-semibold px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>

          {pageCount > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
              {pageCount}p
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-black dark:text-white text-sm leading-snug line-clamp-2">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs text-black/40 dark:text-white/40 line-clamp-1">
              {description}
            </p>
          )}
          <p className="mt-1.5 text-xs text-black/30 dark:text-white/30">{formattedDate}</p>
        </div>
      </div>
    </Link>
  );
}

function PDFPlaceholder({ title }: { title: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/4 dark:bg-white/4 p-6">
      <svg
        className="w-12 h-12 text-black/20 dark:text-white/20 mb-3"
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
      <span className="text-xs text-black/30 dark:text-white/30 text-center line-clamp-2">
        {title}
      </span>
    </div>
  );
}
