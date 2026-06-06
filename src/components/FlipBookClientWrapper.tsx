"use client";

import dynamic from "next/dynamic";

const FlipBookViewer = dynamic(() => import("@/components/FlipBookViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin" />
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
