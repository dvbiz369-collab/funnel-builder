"use client";

import { Funnel } from "@/lib/types";
import { themeStyles } from "@/lib/theme";
import BlockView from "./BlockView";
import { useRef, useState } from "react";

// Plays a funnel start-to-finish: progress bar, step transitions,
// answer tracking, webhook delivery on lead submit. Used by the
// published viewer and the editor's preview mode.
export default function FunnelRunner({ funnel }: { funnel: Funnel }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const answers = useRef<Record<string, string>>({});

  const s = themeStyles(funnel.theme);
  const step = funnel.steps[stepIndex];
  const progress = ((stepIndex + 1) / funnel.steps.length) * 100;

  const goNext = () => {
    if (stepIndex < funnel.steps.length - 1) {
      setStepIndex(stepIndex + 1);
      setAnimKey((k) => k + 1);
    }
  };

  const submitLead = async (fields: Record<string, string>) => {
    const payload = {
      funnel: funnel.name,
      submittedAt: new Date().toISOString(),
      ...fields,
      answers: answers.current,
    };
    if (funnel.webhookUrl) {
      try {
        await fetch(funnel.webhookUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // webhook failure shouldn't break the visitor's flow
      }
    }
  };

  if (!step) return null;

  return (
    <div className="flex h-full w-full flex-col" style={s.container}>
      {funnel.steps.length > 1 && (
        <div className="px-5 pt-4">
          <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: s.cardBorder }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: funnel.theme.primary }}
            />
          </div>
        </div>
      )}
      <div key={animKey} className="funnel-step-enter flex flex-1 flex-col justify-center gap-4 overflow-y-auto px-5 py-7">
        {step.blocks.map((block) => (
          <BlockView
            key={block.id}
            block={block}
            theme={funnel.theme}
            live
            onNext={goNext}
            onAnswer={(q, a) => {
              answers.current[q] = a;
            }}
            onSubmitLead={submitLead}
          />
        ))}
        {step.blocks.length === 0 && (
          <p className="text-center text-sm" style={{ color: s.muted }}>
            This step is empty.
          </p>
        )}
      </div>
    </div>
  );
}
