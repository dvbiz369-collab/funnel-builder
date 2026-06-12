"use client";

import { Block, ChoiceBlock, Funnel, uid } from "@/lib/types";
import { PRIMARY_PRESETS } from "@/lib/theme";

interface InspectorProps {
  funnel: Funnel;
  block: Block | null;
  onChangeBlock: (block: Block) => void;
  onChangeFunnel: (funnel: Funnel) => void;
}

const labelCls = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-3";
const inputCls =
  "w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-[13.5px] text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-[10px] bg-fill p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg px-2 py-1.5 text-[12.5px] font-medium transition-colors ${
            value === o.value
              ? "bg-white text-[#1d1d1f] shadow-sm dark:bg-[#636366] dark:text-white"
              : "text-ink-2 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex w-full items-center justify-between py-1">
      <span className="text-[13.5px] font-medium text-ink">{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-switch-on" : "bg-fill-2"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export default function Inspector({ funnel, block, onChangeBlock, onChangeFunnel }: InspectorProps) {
  if (!block) {
    // No block selected → funnel-level settings
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-[13px] font-semibold tracking-tight text-ink">Funnel design</h3>
          <p className="text-[12px] text-ink-3">Applies to every step</p>
        </div>
        <Field label="Brand color">
          <div className="flex flex-wrap gap-2">
            {PRIMARY_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => onChangeFunnel({ ...funnel, theme: { ...funnel.theme, primary: c } })}
                className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${
                  funnel.theme.primary === c ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""
                }`}
                style={{ background: c }}
              />
            ))}
            <input
              type="color"
              value={funnel.theme.primary}
              onChange={(e) => onChangeFunnel({ ...funnel, theme: { ...funnel.theme, primary: e.target.value } })}
              className="h-7 w-7 cursor-pointer rounded-full border border-line"
              title="Custom color"
            />
          </div>
        </Field>
        <Field label="Background">
          <Seg
            value={funnel.theme.background}
            options={[
              { value: "light", label: "Light" },
              { value: "gradient", label: "Gradient" },
              { value: "dark", label: "Dark" },
            ]}
            onChange={(background) => onChangeFunnel({ ...funnel, theme: { ...funnel.theme, background } })}
          />
        </Field>
        <Field label="Font">
          <Seg
            value={funnel.theme.font}
            options={[
              { value: "sans", label: "Sans" },
              { value: "serif", label: "Serif" },
              { value: "mono", label: "Mono" },
            ]}
            onChange={(font) => onChangeFunnel({ ...funnel, theme: { ...funnel.theme, font } })}
          />
        </Field>
        <div className="border-t border-line pt-4">
          <Field label="Lead webhook URL">
            <input
              className={inputCls}
              placeholder="https://hooks.yourcrm.com/…"
              value={funnel.webhookUrl}
              onChange={(e) => onChangeFunnel({ ...funnel, webhookUrl: e.target.value })}
            />
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-3">
              Form submissions POST here as JSON (works with GoHighLevel, Make, Zapier, n8n inbound webhooks).
            </p>
          </Field>
        </div>
      </div>
    );
  }

  const set = (patch: Partial<Block>) => onChangeBlock({ ...block, ...patch } as Block);

  switch (block.type) {
    case "heading":
      return (
        <Pane title="Heading">
          <Field label="Text">
            <textarea className={`${inputCls} resize-none`} rows={3} value={block.text} onChange={(e) => set({ text: e.target.value })} />
          </Field>
          <Field label="Size">
            <Seg
              value={block.size}
              options={[
                { value: "xl", label: "XL" },
                { value: "lg", label: "Large" },
                { value: "md", label: "Medium" },
              ]}
              onChange={(size) => set({ size })}
            />
          </Field>
          <Field label="Align">
            <Seg
              value={block.align}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
              ]}
              onChange={(align) => set({ align })}
            />
          </Field>
        </Pane>
      );

    case "text":
      return (
        <Pane title="Text">
          <Field label="Copy">
            <textarea className={`${inputCls} resize-none`} rows={5} value={block.text} onChange={(e) => set({ text: e.target.value })} />
          </Field>
          <Field label="Align">
            <Seg
              value={block.align}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
              ]}
              onChange={(align) => set({ align })}
            />
          </Field>
        </Pane>
      );

    case "image":
      return (
        <Pane title="Image">
          <Field label="Image URL">
            <input className={inputCls} value={block.src} onChange={(e) => set({ src: e.target.value })} />
          </Field>
          <Field label="Alt text">
            <input className={inputCls} value={block.alt} onChange={(e) => set({ alt: e.target.value })} />
          </Field>
          <Toggle label="Rounded corners" checked={block.rounded} onChange={(rounded) => set({ rounded })} />
        </Pane>
      );

    case "button":
      return (
        <Pane title="Button">
          <Field label="Label">
            <input className={inputCls} value={block.label} onChange={(e) => set({ label: e.target.value })} />
          </Field>
          <Field label="Tap action">
            <Seg
              value={block.action}
              options={[
                { value: "next", label: "Next step" },
                { value: "link", label: "Link" },
                { value: "call", label: "Call" },
              ]}
              onChange={(action) => set({ action })}
            />
          </Field>
          {block.action === "link" && (
            <Field label="Link URL">
              <input className={inputCls} placeholder="https://…" value={block.href} onChange={(e) => set({ href: e.target.value })} />
            </Field>
          )}
          {block.action === "call" && (
            <Field label="Phone number">
              <input
                className={inputCls}
                placeholder="+1 555 123 4567"
                value={block.phone ?? ""}
                onChange={(e) => set({ phone: e.target.value })}
              />
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-3">
                Tap dials this number directly — perfect for &ldquo;Call us now&rdquo; on mobile.
              </p>
            </Field>
          )}
        </Pane>
      );

    case "choice":
      return (
        <Pane title="Quiz choice">
          <Field label="Question">
            <textarea className={`${inputCls} resize-none`} rows={2} value={block.question} onChange={(e) => set({ question: e.target.value })} />
          </Field>
          <Field label="Options (tap → next step)">
            <div className="flex flex-col gap-2">
              {block.options.map((opt, i) => (
                <div key={opt.id} className="flex items-center gap-1.5">
                  <input
                    className="w-11 rounded-[10px] border border-line bg-surface px-0 py-2 text-center text-[14px] text-ink outline-none focus:border-accent"
                    value={opt.emoji}
                    onChange={(e) => {
                      const options = [...block.options];
                      options[i] = { ...opt, emoji: e.target.value };
                      set({ options } as Partial<ChoiceBlock>);
                    }}
                  />
                  <input
                    className={inputCls}
                    value={opt.label}
                    onChange={(e) => {
                      const options = [...block.options];
                      options[i] = { ...opt, label: e.target.value };
                      set({ options } as Partial<ChoiceBlock>);
                    }}
                  />
                  <button
                    className="px-1 text-ink-3 transition-colors hover:text-red-500"
                    onClick={() => set({ options: block.options.filter((o) => o.id !== opt.id) } as Partial<ChoiceBlock>)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="rounded-[10px] border border-dashed border-line py-2 text-[12.5px] font-medium text-ink-2 transition-colors hover:border-accent hover:text-accent"
                onClick={() =>
                  set({ options: [...block.options, { id: uid(), emoji: "💡", label: "New option" }] } as Partial<ChoiceBlock>)
                }
              >
                + Add option
              </button>
            </div>
          </Field>
        </Pane>
      );

    case "form":
      return (
        <Pane title="Lead form">
          <Field label="Title (optional)">
            <input className={inputCls} value={block.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <div className="flex flex-col">
            <label className={labelCls}>Fields</label>
            <Toggle label="Name" checked={block.collectName} onChange={(collectName) => set({ collectName })} />
            <Toggle label="Email" checked={block.collectEmail} onChange={(collectEmail) => set({ collectEmail })} />
            <Toggle label="Phone" checked={block.collectPhone} onChange={(collectPhone) => set({ collectPhone })} />
          </div>
          <Field label="Button label">
            <input className={inputCls} value={block.buttonLabel} onChange={(e) => set({ buttonLabel: e.target.value })} />
          </Field>
          <Field label="Success message">
            <input className={inputCls} value={block.successMessage} onChange={(e) => set({ successMessage: e.target.value })} />
          </Field>
          <Field label="After submit">
            <Seg
              value={block.successAction ?? "message"}
              options={[
                { value: "message", label: "Message" },
                { value: "next", label: "Next step" },
                { value: "link", label: "Open link" },
              ]}
              onChange={(successAction) => set({ successAction })}
            />
          </Field>
          {(block.successAction ?? "message") === "link" && (
            <Field label="Link URL">
              <input
                className={inputCls}
                placeholder="https://… (PDF, download, thank-you page)"
                value={block.successHref ?? ""}
                onChange={(e) => set({ successHref: e.target.value })}
              />
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-3">
                Opens after the lead is captured — perfect for delivering a lead magnet (PDF, Notion doc, video).
              </p>
            </Field>
          )}
        </Pane>
      );

    case "video":
      return (
        <Pane title="Video">
          <Field label="Video URL">
            <input className={inputCls} placeholder="YouTube, Vimeo, Loom or .mp4 link" value={block.url} onChange={(e) => set({ url: e.target.value })} />
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-3">
              Paste a YouTube, Vimeo or Loom link — or a direct .mp4/.webm URL to use your own video.
            </p>
          </Field>
        </Pane>
      );

    case "rating":
      return (
        <Pane title="Social proof">
          <Field label="Stars">
            <Seg
              value={String(block.stars) as "3" | "4" | "5"}
              options={[
                { value: "3", label: "3★" },
                { value: "4", label: "4★" },
                { value: "5", label: "5★" },
              ]}
              onChange={(v) => set({ stars: Number(v) })}
            />
          </Field>
          <Field label="Quote">
            <textarea className={`${inputCls} resize-none`} rows={3} value={block.quote} onChange={(e) => set({ quote: e.target.value })} />
          </Field>
          <Field label="Author">
            <input className={inputCls} value={block.author} onChange={(e) => set({ author: e.target.value })} />
          </Field>
        </Pane>
      );

    case "calendly":
      return (
        <Pane title="Calendly">
          <Field label="Calendly link">
            <input
              className={inputCls}
              placeholder="calendly.com/you/intro-call"
              value={block.url}
              onChange={(e) => set({ url: e.target.value })}
            />
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-3">
              Paste your Calendly event link — the booking calendar embeds right inside the funnel step. Tip: put it
              on the step after the lead form so you capture contact info even if they don&rsquo;t book.
            </p>
          </Field>
        </Pane>
      );

    case "spacer":
      return (
        <Pane title="Spacer">
          <Field label="Size">
            <Seg
              value={block.size}
              options={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
              ]}
              onChange={(size) => set({ size })}
            />
          </Field>
        </Pane>
      );
  }
}

function Pane({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[13px] font-semibold tracking-tight text-ink">{title}</h3>
        <p className="text-[12px] text-ink-3">Block settings</p>
      </div>
      {children}
    </div>
  );
}
