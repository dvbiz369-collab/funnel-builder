"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Funnel } from "@/lib/types";
import { decodeFunnel } from "@/lib/encode";
import FunnelRunner from "@/components/FunnelRunner";

// Published funnel viewer. The entire funnel is encoded in the URL hash,
// so this page is fully static — no database, no API, no cost.
export default function PublishedFunnel() {
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      setError(true);
      return;
    }
    const f = decodeFunnel(hash);
    if (f) setFunnel(f);
    else setError(true);
  }, []);

  if (error)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas text-ink-2">
        <span className="text-3xl">🔗</span>
        <p className="text-[14px]">This funnel link is invalid or incomplete.</p>
        <Link href="/" className="text-[14px] font-medium text-accent">
          Build your own funnel →
        </Link>
      </div>
    );

  if (!funnel) return null;

  return (
    <div className="flex h-[100dvh] w-full justify-center bg-canvas">
      <div className="h-full w-full max-w-md bg-white shadow-2xl">
        <FunnelRunner funnel={funnel} />
      </div>
    </div>
  );
}
