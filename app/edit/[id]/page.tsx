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
import ThemeToggle from "@/components/ThemeToggle";

const BLOCK_TYPES = Object.keys(BLOCK_META) as BlockType[];

type Sheet = "none" | "blocks" | "inspector";

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [sheet, setSheet] = useState<Sheet>("none");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const f = getFunnel(id);
    if (f) setFunnel(f);
    else setNotFound(true);
  }, [id]);

  const update = (next: Funnel) => {
    setFunnel(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveFunnel(next), 400);
  };

  if (notFound)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas text-ink-2">
        <p>Funnel not found on this device.</p>
        <Link href="/" className="font-medium text-accent">
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
    setSheet("inspector");
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
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
      setSheet("none");
    }
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

  const publish = async () => {
    saveFunnel(funnel);
    const url = publishUrl(funnel);
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title: funnel.name, url });
        return;
      } catch {
        // user cancelled share — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectBlock = (blockId: string) => {
    setSelectedBlockId(blockId);
    setSheet("inspector");
  };

  // Shared canvas — phone-framed on desktop, full-bleed on mobile
  const canvas = (
    <div className="flex h-full flex-col overflow-y-auto" style={s.container}>
      <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-7">
        {step.blocks.map((block, i) => (
          <div
            key={block.id}
            onClick={() => selectBlock(block.id)}
            className={`group relative cursor-pointer rounded-xl px-1 py-1.5 transition-all ${
              selectedBlockId === block.id ? "ring-2 ring-accent" : "md:hover:ring-2 md:hover:ring-line"
            }`}
          >
            <div className="pointer-events-none">
              <BlockView block={block} theme={funnel.theme} live={false} />
            </div>
            <div
              className={`absolute -top-3 right-1 z-10 items-center gap-1 rounded-lg border border-line bg-surface px-1 py-0.5 shadow-md ${
                selectedBlockId === block.id ? "flex" : "hidden md:group-hover:flex"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="px-1.5 py-0.5 text-[13px] text-ink-3 active:text-ink disabled:opacity-30 md:hover:text-ink" disabled={i === 0} onClick={() => moveBlock(block.id, -1)}>↑</button>
              <button className="px-1.5 py-0.5 text-[13px] text-ink-3 active:text-ink disabled:opacity-30 md:hover:text-ink" disabled={i === step.blocks.length - 1} onClick={() => moveBlock(block.id, 1)}>↓</button>
              <button className="px-1.5 py-0.5 text-[13px] text-ink-3 active:text-red-500 md:hover:text-red-500" onClick={() => deleteBlock(block.id)}>✕</button>
            </div>
          </div>
        ))}
        {step.blocks.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <span className="text-2xl">👋</span>
            <p className="text-[13.5px] font-medium" style={{ color: s.muted }}>
              This step is empty.
              <br />
              Tap <b>+ Block</b> to add one.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ── Preview mode: full-screen on mobile, phone frame on desktop ──
  if (preview) {
    return (
      <div className="flex h-[100dvh] flex-col bg-canvas">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-surface/75 px-3 backdrop-blur-xl backdrop-saturate-150">
          <span className="truncate px-1 text-[14px] font-semibold tracking-tight text-ink">{funnel.name}</span>
          <button
            onClick={() => setPreview(false)}
            className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Done
          </button>
        </header>
        <div className="min-h-0 flex-1 md:flex md:items-center md:justify-center md:p-8">
          <div className="h-full md:hidden">
            <FunnelRunner key={funnel.updatedAt} funnel={funnel} />
          </div>
          <div className="hidden md:block">
            <PhoneFrame>
              <FunnelRunner key={funnel.updatedAt} funnel={funnel} />
            </PhoneFrame>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-canvas">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-surface/75 px-3 backdrop-blur-xl backdrop-saturate-150 md:h-14 md:px-4">
        <Link
          href="/"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors active:bg-fill md:hover:bg-fill md:hover:text-ink"
        >
          ←
        </Link>
        <input
          value={funnel.name}
          onChange={(e) => update({ ...funnel, name: e.target.value })}
          className="min-w-0 flex-1 rounded-[10px] border border-transparent bg-transparent px-2 py-1.5 text-[14px] font-semibold tracking-tight text-ink outline-none md:w-64 md:flex-none md:hover:border-line md:focus:border-accent"
        />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setPreview(true)}
            className="rounded-full bg-fill px-4 py-2 text-[13px] font-medium text-ink transition-colors active:bg-fill-2 md:hover:bg-fill-2"
          >
            Preview
          </button>
          <button
            onClick={publish}
            className="rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-colors active:bg-accent-hover md:hover:bg-accent-hover"
          >
            {copied ? "Copied!" : "Publish"}
          </button>
        </div>
      </header>

      {/* Mobile: step chips */}
      <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-line bg-surface px-3 py-2 md:hidden">
        {funnel.steps.map((st, i) => (
          <button
            key={st.id}
            onClick={() => {
              setStepIndex(i);
              setSelectedBlockId(null);
              setSheet("none");
            }}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
              i === stepIndex ? "bg-ink text-canvas" : "bg-fill text-ink-2"
            }`}
          >
            {i + 1} · {st.name}
          </button>
        ))}
        <button
          onClick={addStep}
          className="shrink-0 rounded-full border border-dashed border-line px-3 py-1.5 text-[12.5px] font-medium text-ink-2"
        >
          +
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Desktop left: steps + blocks */}
        <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-line bg-surface md:flex">
          <div className="border-b border-line p-3">
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">Steps</p>
            <div className="flex flex-col gap-1">
              {funnel.steps.map((st, i) => (
                <div
                  key={st.id}
                  className={`group flex cursor-pointer items-center gap-2 rounded-[10px] px-2.5 py-2 text-[13px] font-medium transition-colors ${
                    i === stepIndex ? "bg-fill text-ink" : "text-ink-2 hover:bg-fill"
                  }`}
                  onClick={() => {
                    setStepIndex(i);
                    setSelectedBlockId(null);
                  }}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                      i === stepIndex ? "bg-accent text-white" : "bg-fill text-ink-3"
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
                    className="w-full min-w-0 bg-transparent text-ink outline-none"
                  />
                  <span className="hidden shrink-0 gap-0.5 group-hover:flex">
                    <button className="text-ink-3 hover:text-ink" onClick={(e) => { e.stopPropagation(); moveStep(i, -1); }}>↑</button>
                    <button className="text-ink-3 hover:text-ink" onClick={(e) => { e.stopPropagation(); moveStep(i, 1); }}>↓</button>
                    <button className="text-ink-3 hover:text-red-500" onClick={(e) => { e.stopPropagation(); deleteStep(i); }}>✕</button>
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={addStep}
              className="mt-2 w-full rounded-[10px] border border-dashed border-line py-2 text-[12.5px] font-medium text-ink-2 transition-colors hover:border-accent hover:text-accent"
            >
              + Add step
            </button>
          </div>
          <div className="p-3">
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">Add blocks</p>
            <div className="grid grid-cols-2 gap-1.5">
              {BLOCK_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => addBlock(t)}
                  title={BLOCK_META[t].hint}
                  className="flex flex-col items-start gap-1 rounded-xl border border-line p-2.5 text-left transition-all hover:border-accent hover:bg-fill hover:shadow-sm"
                >
                  <span className="text-[15px] leading-none">{BLOCK_META[t].icon}</span>
                  <span className="text-[11.5px] font-medium text-ink">{BLOCK_META[t].label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <main className="min-w-0 flex-1 md:flex md:items-center md:justify-center md:overflow-auto md:p-8">
          <div className="h-full md:hidden">{canvas}</div>
          <div className="hidden md:block">
            <PhoneFrame>{canvas}</PhoneFrame>
          </div>
        </main>

        {/* Desktop right: inspector */}
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-line bg-surface p-4 md:block">
          <Inspector funnel={funnel} block={selectedBlock} onChangeBlock={changeBlock} onChangeFunnel={update} />
          {selectedBlock && (
            <button
              onClick={() => setSelectedBlockId(null)}
              className="mt-5 w-full rounded-full bg-fill py-2 text-[12.5px] font-medium text-ink transition-colors hover:bg-fill-2"
            >
              ← Funnel design settings
            </button>
          )}
        </aside>
      </div>

      {/* Mobile bottom bar */}
      <div className="flex shrink-0 items-center gap-2 border-t border-line bg-surface px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
        <button
          onClick={() => setSheet(sheet === "blocks" ? "none" : "blocks")}
          className="flex-1 rounded-full bg-accent py-3 text-[14px] font-medium text-white active:bg-accent-hover"
        >
          + Block
        </button>
        <button
          onClick={() => {
            setSelectedBlockId(null);
            setSheet(sheet === "inspector" && !selectedBlock ? "none" : "inspector");
          }}
          className="flex-1 rounded-full bg-fill py-3 text-[14px] font-medium text-ink active:bg-fill-2"
        >
          Design
        </button>
      </div>

      {/* Mobile sheets */}
      {sheet !== "none" && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSheet("none")}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[72dvh] overflow-y-auto rounded-t-[20px] bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-fill-2" />
            {sheet === "blocks" ? (
              <>
                <p className="mb-3 text-[13px] font-semibold tracking-tight text-ink">Add a block</p>
                <div className="grid grid-cols-3 gap-2">
                  {BLOCK_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => addBlock(t)}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-line px-2 py-3 active:border-accent active:bg-fill"
                    >
                      <span className="text-[18px] leading-none">{BLOCK_META[t].icon}</span>
                      <span className="text-center text-[11px] font-medium leading-tight text-ink">
                        {BLOCK_META[t].label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <Inspector funnel={funnel} block={selectedBlock} onChangeBlock={changeBlock} onChangeFunnel={update} />
                <button
                  onClick={() => setSheet("none")}
                  className="mt-5 w-full rounded-full bg-accent py-3 text-[14px] font-medium text-white"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
