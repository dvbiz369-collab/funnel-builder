"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Funnel } from "@/lib/types";
import { listFunnels, saveFunnel, deleteFunnel } from "@/lib/storage";
import { TEMPLATES } from "@/lib/templates";
import { publishUrl } from "@/lib/encode";
import Logo from "@/components/Logo";

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
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-2.5 px-6">
          <Logo />
          <span className="text-[15px] font-bold tracking-tight text-zinc-900">Funnelly</span>
          <span className="ml-2 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-900">
            Mobile funnels in minutes
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="mb-1 text-[20px] font-bold tracking-tight text-zinc-900">Start a new funnel</h2>
        <p className="mb-5 text-[14px] text-zinc-500">Pick a template — everything is editable.</p>
        <div className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => createFrom(t.id)}
              className="group flex flex-col items-start gap-2 rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md"
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-[14.5px] font-bold text-zinc-900">{t.name}</span>
              <span className="text-[12.5px] leading-relaxed text-zinc-500">{t.description}</span>
              <span className="mt-1 text-[12.5px] font-semibold text-zinc-900 opacity-0 transition-opacity group-hover:opacity-100">
                Use template →
              </span>
            </button>
          ))}
        </div>

        <h2 className="mb-5 text-[20px] font-bold tracking-tight text-zinc-900">Your funnels</h2>
        {loaded && funnels.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/50 py-14 text-center">
            <p className="text-[14px] text-zinc-500">No funnels yet — pick a template above to start.</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {funnels.map((f) => (
            <div
              key={f.id}
              onClick={() => router.push(`/edit/${f.id}`)}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm transition-shadow active:bg-zinc-50 sm:gap-4 sm:p-4 md:hover:shadow-md"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold text-white"
                style={{ background: f.theme.primary }}
              >
                {f.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-bold text-zinc-900">{f.name}</p>
                <p className="text-[12.5px] text-zinc-400">
                  {f.steps.length} step{f.steps.length === 1 ? "" : "s"} ·{" "}
                  {new Date(f.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyLink(f);
                }}
                className="shrink-0 rounded-xl bg-zinc-100 px-3 py-2 text-[12.5px] font-semibold text-zinc-700 active:bg-zinc-200 md:hover:bg-zinc-200"
              >
                {copiedId === f.id ? "✓" : "Share"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${f.name}"? This can't be undone.`)) remove(f.id);
                }}
                className="shrink-0 rounded-xl px-1.5 py-2 text-zinc-300 active:text-red-500 md:hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-[12px] leading-relaxed text-zinc-400">
          Funnels are saved in your browser. Publishing packs the whole funnel into the share link —
          <br />
          no account, no database, nothing to pay for.
        </p>
      </main>
    </div>
  );
}
