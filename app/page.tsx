"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Funnel } from "@/lib/types";
import { listFunnels, saveFunnel, deleteFunnel } from "@/lib/storage";
import { TEMPLATES } from "@/lib/templates";
import { publishUrl } from "@/lib/encode";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

export default function Dashboard() {
  const router = useRouter();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setFunnels(listFunnels());
    setLoaded(true);
  }, []);

  const createFrom = (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId)!;
    const funnel = tpl.build();
    saveFunnel(funnel);
    router.push(`/edit/${funnel.id}`);
  };

  const remove = (id: string) => {
    deleteFunnel(id);
    setFunnels(listFunnels());
  };

  const copyLink = async (f: Funnel) => {
    await navigator.clipboard.writeText(publishUrl(f));
    setCopiedId(f.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/75 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2.5 px-6">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight text-ink">Funnelly</span>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-[40px] font-semibold leading-tight tracking-[-0.022em] text-ink sm:text-[48px]">
            Mobile funnels.
            <br />
            <span className="text-ink-3">In minutes.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[16px] leading-relaxed text-ink-2">
            Quiz steps, lead forms, tap-to-call. No account, no database — your funnel lives in
            the share link.
          </p>
        </div>

        <h2 className="mb-1 text-[21px] font-semibold tracking-tight text-ink">Start a new funnel</h2>
        <p className="mb-5 text-[14px] text-ink-2">Pick a template — everything is editable.</p>
        <div className="mb-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => createFrom(t.id)}
              className="group flex flex-col items-start gap-2 rounded-[18px] border border-line bg-surface p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-[15px] font-semibold tracking-tight text-ink">{t.name}</span>
              <span className="text-[12.5px] leading-relaxed text-ink-2">{t.description}</span>
              <span className="mt-1 text-[12.5px] font-medium text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Use template →
              </span>
            </button>
          ))}
        </div>

        <h2 className="mb-5 text-[21px] font-semibold tracking-tight text-ink">Your funnels</h2>
        {loaded && funnels.length === 0 && (
          <div className="rounded-[18px] border border-dashed border-line bg-surface/50 py-14 text-center">
            <p className="text-[14px] text-ink-2">No funnels yet — pick a template above to start.</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {funnels.map((f) => (
            <div
              key={f.id}
              onClick={() => router.push(`/edit/${f.id}`)}
              className="flex cursor-pointer items-center gap-3 rounded-[18px] border border-line bg-surface p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 active:bg-fill sm:gap-4 sm:p-4 md:hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold text-white"
                style={{ background: f.theme.primary }}
              >
                {f.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold tracking-tight text-ink">{f.name}</p>
                <p className="text-[12.5px] text-ink-3">
                  {f.steps.length} step{f.steps.length === 1 ? "" : "s"} ·{" "}
                  {new Date(f.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyLink(f);
                }}
                className="shrink-0 rounded-full bg-fill px-4 py-2 text-[12.5px] font-medium text-ink transition-colors active:bg-fill-2 md:hover:bg-fill-2"
              >
                {copiedId === f.id ? "✓ Copied" : "Share"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${f.name}"? This can't be undone.`)) remove(f.id);
                }}
                className="shrink-0 rounded-full px-1.5 py-2 text-ink-3 transition-colors active:text-red-500 md:hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <p className="mt-14 text-center text-[12px] leading-relaxed text-ink-3">
          Funnels are saved in your browser. Publishing packs the whole funnel into the share link —
          <br />
          no account, no database, nothing to pay for.
        </p>
      </main>
    </div>
  );
}
