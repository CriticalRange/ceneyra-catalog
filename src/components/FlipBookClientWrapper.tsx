"use client";

import dynamic from "next/dynamic";

const FlipBookViewer = dynamic(() => import("@/components/FlipBookViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading flipbook…</p>
      </div>
    </div>
  ),
});

interface Props {
  pdfUrl: string;
  title: string;
}

export default function FlipBookClientWrapper({ pdfUrl, title }: Props) {
  return <FlipBookViewer pdfUrl={pdfUrl} title={title} />;
}
