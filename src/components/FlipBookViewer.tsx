"use client";

import { useState, useRef, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import React from "react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FlipBookViewerProps {
  pdfUrl: string;
  title: string;
}

type PageFlipApi = {
  flipNext: () => void;
  flipPrev: () => void;
};

const FlipPage = React.forwardRef<
  HTMLDivElement,
  { pageNumber: number; width: number; height: number }
>(({ pageNumber, width, height }, ref) => (
  <div ref={ref} className="bg-white overflow-hidden" style={{ width, height }}>
    <Page
      pageNumber={pageNumber}
      width={width}
      renderTextLayer={false}
      renderAnnotationLayer={false}
      className="block"
    />
  </div>
));
FlipPage.displayName = "FlipPage";

export default function FlipBookViewer({ pdfUrl, title }: FlipBookViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [atCover, setAtCover] = useState(true);
  const [zoom, setZoom] = useState(1);
  const flipBookRef = useRef<{
    pageFlip: () => PageFlipApi | undefined;
  } | null>(null);

  const PAGE_WIDTH = 520;
  const PAGE_HEIGHT = 735;

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data + 1);
    setAtCover(e.data === 0);
  }, []);

  const goToNextPage = () => {
    if (atCover) setAtCover(false);
    flipBookRef.current?.pageFlip()?.flipNext();
  };
  const goToPrevPage = () => {
    if (currentPage <= 2) setAtCover(true);
    flipBookRef.current?.pageFlip()?.flipPrev();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="text-sm text-slate-600 w-14 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setZoom(1)}
          className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Flipbook */}
      <div
        className="flipbook-viewport overflow-hidden"
        style={{
          width: atCover ? PAGE_WIDTH : PAGE_WIDTH * 2,
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          transition: "width 0.7s ease",
        }}
      >
        <div
          className="flipbook-wrapper relative"
          style={{
            width: PAGE_WIDTH * 2,
            transform: `translateX(${atCover ? -PAGE_WIDTH : 0}px)`,
            transition: "transform 0.7s ease",
          }}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div
                className="flex items-center justify-center bg-white rounded-lg shadow-lg"
                style={{ width: PAGE_WIDTH * 2, height: PAGE_HEIGHT }}
              >
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Loading catalog…</p>
                </div>
              </div>
            }
            error={
              <div
                className="flex items-center justify-center bg-white rounded-lg shadow-lg"
                style={{ width: PAGE_WIDTH * 2, height: PAGE_HEIGHT }}
              >
                <p className="text-red-500 text-sm">Failed to load PDF.</p>
              </div>
            }
          >
            {numPages > 0 && (
              <HTMLFlipBook
                ref={flipBookRef}
                width={PAGE_WIDTH}
                height={PAGE_HEIGHT}
                size="fixed"
                minWidth={300}
                maxWidth={PAGE_WIDTH}
                minHeight={400}
                maxHeight={PAGE_HEIGHT}
                showCover={true}
                flippingTime={700}
                style={{ margin: "0 auto" }}
                startPage={0}
                drawShadow={true}
                usePortrait={false}
                startZIndex={0}
                autoSize={true}
                maxShadowOpacity={0.4}
                mobileScrollSupport={true}
                clickEventForward={true}
                useMouseEvents={true}
              swipeDistance={30}
              showPageCorners={false}
              disableFlipByClick={false}
              onChangeState={(e: { data: string }) => {
                if (
                  atCover &&
                  (e.data === "flipping" || e.data === "user_fold" || e.data === "fold_corner")
                ) {
                  setAtCover(false);
                }
              }}
              onFlip={onFlip}
              className="shadow-2xl rounded-sm"
            >
                {Array.from({ length: numPages }, (_, i) => (
                  <FlipPage
                    key={i}
                    pageNumber={i + 1}
                    width={PAGE_WIDTH}
                    height={PAGE_HEIGHT}
                  />
                ))}
              </HTMLFlipBook>
            )}
          </Document>
        </div>
      </div>

      {numPages > 0 && (
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <span className="text-sm text-slate-500 tabular-nums">
            {currentPage} / {numPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-sm"
          >
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-1">
        Tip: Click page corners to flip, or use the buttons
      </p>
    </div>
  );
}
