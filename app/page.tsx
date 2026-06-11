"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Funnel } from "@/lib/types";
import { listFunnels, saveFunnel, deleteFunnel } from "@/lib/storage";
import { TEMPLATES } from "@/lib/templates";
import { publishUrl } from "@/lib/encode";

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
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-[15px] font-bold text-white shadow-sm">
            F
          </span>
          <span className="text-[15px] font-bold tracking-tight text-zinc-900">Funnelly</span>
          <span className="ml-2 rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-600">
            Mobile funnels in minutes
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="mb-1 text-[20px] font-bold tracking-tight text-zinc-900">Start a new funnel</h2>
        <p className="mb-5 text-[14px] text-zinc-500">Pick a template — everything is editable.</p>
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => createFrom(t.id)}
              className="group flex flex-col items-start gap-2 rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-[14.5px] font-bold text-zinc-900">{t.name}</span>
              <span className="text-[12.5px] leading-relaxed text-zinc-500">{t.description}</span>
              <span className="mt-1 text-[12.5px] font-semibold text-violet-600 opacity-0 transition-opacity group-hover:opacity-100">
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
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
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
                  {f.steps.length} step{f.steps.length === 1 ? "" : "s"} · updated{" "}
                  {new Date(f.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => copyLink(f)}
                className="rounded-xl bg-zinc-100 px-3.5 py-2 text-[12.5px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-200"
              >
                {copiedId === f.id ? "✓ Copied" : "Copy link"}
              </button>
              <button
                onClick={() => router.push(`/edit/${f.id}`)}
                className="rounded-xl bg-violet-600 px-3.5 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-violet-700"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${f.name}"? This can't be undone.`)) remove(f.id);
                }}
                className="rounded-xl px-2 py-2 text-zinc-300 transition-colors hover:text-red-500"
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
