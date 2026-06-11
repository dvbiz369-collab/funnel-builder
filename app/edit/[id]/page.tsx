"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Block, BlockType, Funnel, Step, uid } from "@/lib/types";
import { getFunnel, saveFunnel } from "@/lib/storage";
import { newBlock, BLOCK_META } from "@/lib/blocks";
import { publishUrl } from "@/lib/encode";
import { themeStyles } from "@/lib/theme";
import BlockView from "@/components/BlockView";
import FunnelRunner from "@/components/FunnelRunner";
import PhoneFrame from "@/components/PhoneFrame";
import Inspector from "@/components/Inspector";

const BLOCK_TYPES = Object.keys(BLOCK_META) as BlockType[];

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const f = getFunnel(id);
    if (f) setFunnel(f);
    else setNotFound(true);
  }, [id]);

  // Debounced autosave
  const update = (next: Funnel) => {
    setFunnel(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveFunnel(next), 400);
  };

  if (notFound)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-zinc-500">
        <p>Funnel not found on this device.</p>
        <Link href="/" className="font-semibold text-violet-600">
          ← Back to dashboard
        </Link>
      </div>
    );
  if (!funnel) return null;

  const step = funnel.steps[stepIndex] ?? funnel.steps[0];
  const selectedBlock = step.blocks.find((b) => b.id === selectedBlockId) ?? null;
  const s = themeStyles(funnel.theme);

  const updateStep = (patch: Partial<Step>) => {
    const steps = funnel.steps.map((st, i) => (i === stepIndex ? { ...st, ...patch } : st));
    update({ ...funnel, steps });
  };

  const addBlock = (type: BlockType) => {
    const block = newBlock(type);
    updateStep({ blocks: [...step.blocks, block] });
    setSelectedBlockId(block.id);
  };

  const changeBlock = (block: Block) => {
    updateStep({ blocks: step.blocks.map((b) => (b.id === block.id ? block : b)) });
  };

  const moveBlock = (blockId: string, dir: -1 | 1) => {
    const i = step.blocks.findIndex((b) => b.id === blockId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= step.blocks.length) return;
    const blocks = [...step.blocks];
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    updateStep({ blocks });
  };

  const deleteBlock = (blockId: string) => {
    updateStep({ blocks: step.blocks.filter((b) => b.id !== blockId) });
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  };

  const addStep = () => {
    const st: Step = { id: uid(), name: `Step ${funnel.steps.length + 1}`, blocks: [] };
    update({ ...funnel, steps: [...funnel.steps, st] });
    setStepIndex(funnel.steps.length);
    setSelectedBlockId(null);
  };

  const deleteStep = (i: number) => {
    if (funnel.steps.length <= 1) return;
    const steps = funnel.steps.filter((_, idx) => idx !== i);
    update({ ...funnel, steps });
    setStepIndex(Math.max(0, Math.min(stepIndex, steps.length - 1)));
    setSelectedBlockId(null);
  };

  const moveStep = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= funnel.steps.length) return;
    const steps = [...funnel.steps];
    [steps[i], steps[j]] = [steps[j], steps[i]];
    update({ ...funnel, steps });
    if (stepIndex === i) setStepIndex(j);
    else if (stepIndex === j) setStepIndex(i);
  };

  const copyPublishLink = async () => {
    saveFunnel(funnel);
    await navigator.clipboard.writeText(publishUrl(funnel));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
        >
          ←
        </Link>
        <input
          value={funnel.name}
          onChange={(e) => update({ ...funnel, name: e.target.value })}
          className="w-64 rounded-lg border border-transparent px-2 py-1.5 text-[14px] font-semibold outline-none transition-colors hover:border-zinc-200 focus:border-violet-400"
        />
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className={`rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors ${
              preview ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {preview ? "✕ Exit preview" : "▶ Preview"}
          </button>
          <button
            onClick={copyPublishLink}
            className="rounded-xl bg-violet-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
          >
            {copied ? "✓ Link copied!" : "Publish · Copy link"}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left: steps + blocks */}
        {!preview && (
          <aside className="flex w-60 shrink-0 flex-col overflow-y-auto border-r border-zinc-200 bg-white">
            <div className="border-b border-zinc-100 p-3">
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Steps</p>
              <div className="flex flex-col gap-1">
                {funnel.steps.map((st, i) => (
                  <div
                    key={st.id}
                    className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                      i === stepIndex ? "bg-violet-50 text-violet-700" : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                    onClick={() => {
                      setStepIndex(i);
                      setSelectedBlockId(null);
                    }}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                        i === stepIndex ? "bg-violet-600 text-white" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <input
                      value={st.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const steps = funnel.steps.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x));
                        update({ ...funnel, steps });
                      }}
                      className="w-full min-w-0 bg-transparent outline-none"
                    />
                    <span className="hidden shrink-0 gap-0.5 group-hover:flex">
                      <button className="text-zinc-300 hover:text-zinc-600" onClick={(e) => { e.stopPropagation(); moveStep(i, -1); }}>↑</button>
                      <button className="text-zinc-300 hover:text-zinc-600" onClick={(e) => { e.stopPropagation(); moveStep(i, 1); }}>↓</button>
                      <button className="text-zinc-300 hover:text-red-500" onClick={(e) => { e.stopPropagation(); deleteStep(i); }}>✕</button>
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={addStep}
                className="mt-2 w-full rounded-lg border border-dashed border-zinc-300 py-2 text-[12.5px] font-medium text-zinc-500 transition-colors hover:border-violet-400 hover:text-violet-600"
              >
                + Add step
              </button>
            </div>
            <div className="p-3">
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Add blocks</p>
              <div className="grid grid-cols-2 gap-1.5">
                {BLOCK_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => addBlock(t)}
                    title={BLOCK_META[t].hint}
                    className="flex flex-col items-start gap-1 rounded-xl border border-zinc-200 p-2.5 text-left transition-all hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-sm"
                  >
                    <span className="text-[15px] leading-none">{BLOCK_META[t].icon}</span>
                    <span className="text-[11.5px] font-semibold text-zinc-700">{BLOCK_META[t].label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Center: canvas */}
        <main className="flex min-w-0 flex-1 items-center justify-center overflow-auto p-8">
          <PhoneFrame>
            {preview ? (
              <FunnelRunner key={JSON.stringify(funnel.theme) + funnel.steps.length} funnel={funnel} />
            ) : (
              <div className="flex h-full flex-col overflow-y-auto" style={s.container}>
                <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-7">
                  {step.blocks.map((block, i) => (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`group relative cursor-pointer rounded-xl px-1 py-1.5 transition-all ${
                        selectedBlockId === block.id
                          ? "ring-2 ring-violet-500"
                          : "hover:ring-2 hover:ring-violet-200"
                      }`}
                    >
                      <div className="pointer-events-none">
                        <BlockView block={block} theme={funnel.theme} live={false} />
                      </div>
                      <div
                        className={`absolute -right-1 -top-3 z-10 hidden items-center gap-0.5 rounded-lg border border-zinc-200 bg-white px-1 py-0.5 shadow-md ${
                          selectedBlockId === block.id ? "flex" : "group-hover:flex"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className="px-1 text-[11px] text-zinc-400 hover:text-zinc-800 disabled:opacity-30" disabled={i === 0} onClick={() => moveBlock(block.id, -1)}>↑</button>
                        <button className="px-1 text-[11px] text-zinc-400 hover:text-zinc-800 disabled:opacity-30" disabled={i === step.blocks.length - 1} onClick={() => moveBlock(block.id, 1)}>↓</button>
                        <button className="px-1 text-[11px] text-zinc-400 hover:text-red-500" onClick={() => deleteBlock(block.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                  {step.blocks.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-16 text-center">
                      <span className="text-2xl">👋</span>
                      <p className="text-[13.5px] font-medium" style={{ color: s.muted }}>
                        Add your first block
                        <br />
                        from the left panel
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </PhoneFrame>
        </main>

        {/* Right: inspector */}
        {!preview && (
          <aside className="w-72 shrink-0 overflow-y-auto border-l border-zinc-200 bg-white p-4">
            <Inspector funnel={funnel} block={selectedBlock} onChangeBlock={changeBlock} onChangeFunnel={update} />
            {selectedBlock && (
              <button
                onClick={() => setSelectedBlockId(null)}
                className="mt-5 w-full rounded-lg bg-zinc-100 py-2 text-[12.5px] font-medium text-zinc-600 transition-colors hover:bg-zinc-200"
              >
                ← Funnel design settings
              </button>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
