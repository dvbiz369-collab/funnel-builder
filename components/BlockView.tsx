"use client";

import { Block, Theme } from "@/lib/types";
import { themeStyles, videoEmbedUrl } from "@/lib/theme";
import { useState } from "react";

interface BlockViewProps {
  block: Block;
  theme: Theme;
  live: boolean; // true in published funnel / preview, false on editor canvas
  onNext?: () => void;
  onAnswer?: (question: string, answer: string) => void;
  onSubmitLead?: (fields: Record<string, string>) => Promise<void> | void;
}

const SPACER_SIZES = { sm: 12, md: 28, lg: 56 };
const HEADING_SIZES = { xl: "text-[2rem] leading-[1.12]", lg: "text-2xl leading-tight", md: "text-xl leading-snug" };

export default function BlockView({ block, theme, live, onNext, onAnswer, onSubmitLead }: BlockViewProps) {
  const s = themeStyles(theme);

  switch (block.type) {
    case "heading":
      return (
        <h2
          className={`font-bold tracking-tight ${HEADING_SIZES[block.size]} ${block.align === "center" ? "text-center" : "text-left"}`}
        >
          {block.text}
        </h2>
      );

    case "text":
      return (
        <p
          className={`whitespace-pre-line text-[15px] leading-relaxed ${block.align === "center" ? "text-center" : "text-left"}`}
          style={{ color: s.muted }}
        >
          {block.text}
        </p>
      );

    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.src}
          alt={block.alt}
          className={`w-full object-cover ${block.rounded ? "rounded-2xl" : ""}`}
          style={{ maxHeight: 260 }}
        />
      );

    case "button":
      return (
        <button
          className="w-full rounded-2xl py-3.5 text-[15px] font-semibold text-white shadow-lg transition-transform active:scale-[0.98]"
          style={{ background: theme.primary, boxShadow: `0 8px 24px -8px ${theme.primary}99` }}
          onClick={() => {
            if (!live) return;
            if (block.action === "call" && block.phone) {
              window.location.href = `tel:${block.phone.replace(/[^+\d]/g, "")}`;
            } else if (block.action === "link" && block.href) {
              window.open(block.href, "_blank");
            } else {
              onNext?.();
            }
          }}
        >
          {block.action === "call" ? "📞 " : ""}
          {block.label}
        </button>
      );

    case "choice":
      return (
        <div className="flex flex-col gap-2.5">
          <p className="text-center text-[17px] font-semibold leading-snug">{block.question}</p>
          {block.options.map((opt) => (
            <button
              key={opt.id}
              className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-[15px] font-medium transition-all active:scale-[0.98]"
              style={{ background: s.cardBg, borderColor: s.cardBorder }}
              onClick={() => {
                if (!live) return;
                onAnswer?.(block.question, opt.label);
                onNext?.();
              }}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span>{opt.label}</span>
              <span className="ml-auto text-sm" style={{ color: theme.primary }}>
                →
              </span>
            </button>
          ))}
        </div>
      );

    case "form":
      return <LeadForm block={block} theme={theme} live={live} onSubmitLead={onSubmitLead} />;

    case "video": {
      const embed = videoEmbedUrl(block.url);
      if (!embed)
        return (
          <div
            className="flex aspect-video w-full items-center justify-center rounded-2xl text-sm"
            style={{ background: s.cardBg, color: s.muted }}
          >
            Paste a YouTube or Vimeo URL
          </div>
        );
      return (
        <div className="aspect-video w-full overflow-hidden rounded-2xl">
          {live ? (
            <iframe src={embed} className="h-full w-full" allowFullScreen allow="accelerometer; autoplay; encrypted-media" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: "#000" }}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 pl-1 text-xl">▶</span>
            </div>
          )}
        </div>
      );
    }

    case "rating":
      return (
        <div className="rounded-2xl border p-4" style={{ background: s.cardBg, borderColor: s.cardBorder }}>
          <div className="mb-1.5 text-[15px] tracking-wide" style={{ color: "#F5A623" }}>
            {"★".repeat(block.stars)}
            <span style={{ color: s.cardBorder }}>{"★".repeat(5 - block.stars)}</span>
          </div>
          <p className="text-[14px] leading-relaxed">&ldquo;{block.quote}&rdquo;</p>
          <p className="mt-2 text-[12.5px] font-medium" style={{ color: s.muted }}>
            {block.author}
          </p>
        </div>
      );

    case "spacer":
      return <div style={{ height: SPACER_SIZES[block.size] }} />;
  }
}

function LeadForm({
  block,
  theme,
  live,
  onSubmitLead,
}: {
  block: Extract<Block, { type: "form" }>;
  theme: Theme;
  live: boolean;
  onSubmitLead?: (fields: Record<string, string>) => Promise<void> | void;
}) {
  const s = themeStyles(theme);
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const fields: { key: string; label: string; type: string }[] = [];
  if (block.collectName) fields.push({ key: "name", label: "Full name", type: "text" });
  if (block.collectEmail) fields.push({ key: "email", label: "Email address", type: "email" });
  if (block.collectPhone) fields.push({ key: "phone", label: "Phone number", type: "tel" });

  if (status === "done") {
    return (
      <div className="rounded-2xl border p-6 text-center" style={{ background: s.cardBg, borderColor: s.cardBorder }}>
        <div className="mb-2 text-3xl">✅</div>
        <p className="text-[15px] font-semibold">{block.successMessage}</p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-2.5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!live) return;
        setStatus("sending");
        await onSubmitLead?.(values);
        setStatus("done");
      }}
    >
      {block.title && <p className="text-center text-[17px] font-semibold">{block.title}</p>}
      {fields.map((f) => (
        <input
          key={f.key}
          type={f.type}
          required
          placeholder={f.label}
          value={values[f.key] ?? ""}
          readOnly={!live}
          onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
          className="w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors focus:border-transparent focus:ring-2"
          style={{
            background: s.inputBg,
            borderColor: s.inputBorder,
            color: s.dark ? "#F4F4F5" : "#18181B",
            ["--tw-ring-color" as string]: theme.primary,
          }}
        />
      ))}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 w-full rounded-2xl py-3.5 text-[15px] font-semibold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
        style={{ background: theme.primary, boxShadow: `0 8px 24px -8px ${theme.primary}99` }}
      >
        {status === "sending" ? "Sending…" : block.buttonLabel}
      </button>
      <p className="text-center text-[11px]" style={{ color: s.muted }}>
        🔒 Your info is safe. No spam, ever.
      </p>
    </form>
  );
}
