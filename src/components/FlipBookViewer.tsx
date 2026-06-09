"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { toast } from "@/components/Toast";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import React from "react";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const PAGE_WIDTH = 520;
const PAGE_HEIGHT = 735;

interface FlipBookViewerProps {
  pdfUrl: string;
  title: string;
}

type PageFlipApi = {
  flipNext: () => void;
  flipPrev: () => void;
  flip: (page: number) => void;
  getCurrentPageIndex: () => number;
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
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [atCover, setAtCover] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [numVisible, setNumVisible] = useState(true);
  const [zoom, setZoom] = useState(1);
  const autoZoomRef = useRef(1);
  const flipBookRef = useRef<{ pageFlip: () => PageFlipApi | undefined } | null>(null);
  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipEnableTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flippingToCoverRef = useRef(false);
  const lastFlipIndexRef = useRef(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [editingCounter, setEditingCounter] = useState(false);
  const [counterInput, setCounterInput] = useState("");

  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
      if (flipEnableTimeoutRef.current) clearTimeout(flipEnableTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const computeZoom = () => {
      const scaleW = (window.innerWidth - 120) / (PAGE_WIDTH * 2);
      const scaleH = (window.innerHeight - 180) / PAGE_HEIGHT;
      const z = Math.min(scaleW, scaleH, 1);
      autoZoomRef.current = z;
      setZoom(z);
    };
    computeZoom();
    window.addEventListener("resize", computeZoom);
    return () => window.removeEventListener("resize", computeZoom);
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfLoading(false);
  }, []);

  const onFlip = useCallback((e: { data: number }) => {
    flippingToCoverRef.current = false;
    lastFlipIndexRef.current = e.data;
    setCurrentPage(e.data + 1);
    setAtCover(e.data === 0);
    setAtEnd(e.data >= numPages - 2);
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    if (flipEnableTimeoutRef.current) clearTimeout(flipEnableTimeoutRef.current);
    flipEnableTimeoutRef.current = setTimeout(() => {
      setIsFlipping(false);
    }, 600);
    flipTimeoutRef.current = setTimeout(() => {
      setNumVisible(true);
    }, 700);
  }, [numPages]);

  const goToNextPage = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setNumVisible(false);
    if (atCover) setAtCover(false);
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  const goToPrevPage = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setNumVisible(false);
    if (currentPage <= 2) {
      flippingToCoverRef.current = true;
      setAtCover(true);
    }
    setAtEnd(false);
    flipBookRef.current?.pageFlip()?.flipPrev();
  };

  const openCounterEdit = () => {
    setCounterInput(String(currentPage));
    setEditingCounter(true);
  };

  const commitCounterEdit = () => {
    let page = parseInt(counterInput, 10);
    if (page === 0) page = 1;
    const alreadyVisible = page === currentPage || (!atCover && page === currentPage + 1);
    if (isNaN(page) || page < 1 || page > numPages) {
      toast({ message: `Page must be between 1 and ${numPages}`, type: "error", duration: 3000 });
      setEditingCounter(false);
      return;
    }
    if (!alreadyVisible) {
      setIsFlipping(true);
      setNumVisible(false);
      if (page === 1) {
        flippingToCoverRef.current = true;
        setAtCover(true);
      } else {
        setAtCover(false);
      }
      flipBookRef.current?.pageFlip()?.flip(page - 1);
    }
    setEditingCounter(false);
  };


  const numStyle: React.CSSProperties = {
    transition: "opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: numVisible ? 1 : 0,
  };

  const bookW = atCover ? PAGE_WIDTH : PAGE_WIDTH * 2;

  const flipPages = useMemo(
    () => Array.from({ length: numPages }, (_, i) => (
      <FlipPage key={i} pageNumber={i + 1} width={PAGE_WIDTH} height={PAGE_HEIGHT} />
    )),
    [numPages]
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="flex-shrink-0 text-center pt-4 pb-2">
        <h1 className="text-2xl font-bold text-black dark:text-white">{title}</h1>
      </div>

      {/* Scrollable book area */}
      <div className="flex-1 overflow-auto flex justify-center">
        <div className="flex flex-col items-center justify-center min-h-full gap-3 py-4 flex-shrink-0">

          {/* Prev + Book + Next */}
          <div className="flex gap-4">
            {/* Prev button — vertically centered with book only */}
            <div className="flex items-center flex-shrink-0" style={{ height: PAGE_HEIGHT * zoom }}>
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1 || numPages === 0 || isFlipping}
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all text-white"
                style={{ background: "#172c4f" }}
                aria-label="Previous page"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* Book column */}
            <div className="flex flex-col items-center">
              {/* Sizer: claims the correct layout space so scrolling works */}
              <div style={{
                width: bookW * zoom,
                height: PAGE_HEIGHT * zoom,
                position: "relative",
                flexShrink: 0,
                transition: "width 0.7s ease",
              }}>
                {/* Loading / error overlay — always centered in the sizer */}
                {(pdfLoading || pdfError) && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-white rounded-lg shadow-lg"
                  >
                    {pdfError ? (
                      <p className="text-red-500 text-sm">Failed to load PDF.</p>
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#172c4f]/20 border-t-[#172c4f] rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-slate-500">Loading catalog…</p>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className="flipbook-viewport overflow-hidden absolute top-0 left-0"
                  style={{
                    width: bookW,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
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
                      onLoadError={() => { setPdfLoading(false); setPdfError(true); }}
                      loading={null}
                      error={null}
                    >
                      {numPages > 0 && (
                        <HTMLFlipBook
                          ref={flipBookRef}
                          width={PAGE_WIDTH}
                          height={PAGE_HEIGHT}
                          size="fixed"
                          minWidth={300}
                          maxWidth={PAGE_WIDTH}
                          minHeight={200}
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
                            if (atCover && !flippingToCoverRef.current && (e.data === "flipping" || e.data === "user_fold" || e.data === "fold_corner")) {
                              setAtCover(false);
                            }
                            if (e.data === "read") {
                              flippingToCoverRef.current = false;
                              if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
                              if (flipEnableTimeoutRef.current) clearTimeout(flipEnableTimeoutRef.current);
                              const idx = lastFlipIndexRef.current;
                              setCurrentPage(idx + 1);
                              setAtCover(idx === 0);
                              setAtEnd(idx >= numPages - 2);
                              setIsFlipping(false);
                              setNumVisible(true);
                            }
                          }}
                          onFlip={onFlip}
                          className="shadow-2xl rounded-sm"
                        >
                          {flipPages}
                        </HTMLFlipBook>
                      )}
                    </Document>
                  </div>
                </div>
              </div>

              {/* Counter — natural size, centered under scaled book */}
              {numPages > 0 && (
                <div className="flex items-center justify-center mt-3" style={{
                  width: bookW * zoom,
                  transition: "width 0.7s ease",
                }}>
                  {editingCounter ? (
                    <input
                      autoFocus
                      type="text"
                      inputMode="numeric"
                      value={counterInput}
                      onChange={(e) => setCounterInput(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => { if (e.key === "Enter") commitCounterEdit(); if (e.key === "Escape") setEditingCounter(false); }}
                      onFocus={(e) => e.target.select()}
                      onBlur={() => setEditingCounter(false)}
                      className="h-9 px-4 rounded-full text-sm font-semibold text-center tabular-nums outline-none border-2 border-white/60 w-24"
                      style={{ background: "#172c4f", color: "#fff" }}
                    />
                  ) : (
                    <span
                      onClick={openCounterEdit}
                      className="flex items-center justify-center h-9 px-4 rounded-full text-sm font-semibold text-white tabular-nums cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ ...numStyle, background: "#172c4f" }}
                      title="Click to jump to page"
                    >
                      {atCover
                        ? `${currentPage} / ${numPages}`
                        : `${currentPage}-${Math.min(currentPage + 1, numPages)} / ${numPages}`}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Next button — vertically centered with book only */}
            <div className="flex items-center flex-shrink-0" style={{ height: PAGE_HEIGHT * zoom }}>
              <button
                onClick={goToNextPage}
                disabled={atEnd || numPages === 0 || isFlipping}
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all text-white"
                style={{ background: "#172c4f" }}
                aria-label="Next page"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="grid items-center gap-2" style={{ gridTemplateColumns: "1fr auto 1fr", width: PAGE_WIDTH * zoom }}>
            <div className="flex justify-start">
              <button onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))} className="w-10 h-10 rounded-full flex items-center justify-center text-sm cursor-pointer shadow-sm" style={{ background: "#172c4f", color: "#fff" }} aria-label="Zoom out">−</button>
            </div>
            <span className="text-sm tabular-nums font-semibold text-center text-white">{Math.round(zoom * 100)}%</span>
            <div className="flex justify-end gap-2">
              <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))} className="w-10 h-10 rounded-full flex items-center justify-center text-sm cursor-pointer shadow-sm" style={{ background: "#172c4f", color: "#fff" }} aria-label="Zoom in">+</button>
              <button onClick={() => setZoom(autoZoomRef.current)} className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-sm" style={{ background: "#172c4f", color: "#fff" }} aria-label="Reset zoom">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Tip: Click page corners to flip, or use the buttons
          </p>
        </div>
      </div>
    </div>
  );
}
