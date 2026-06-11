import { Funnel, uid, DEFAULT_THEME } from "./types";

export interface TemplateDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  build: () => Funnel;
}

function base(name: string): Omit<Funnel, "steps"> {
  return {
    id: uid(),
    name,
    theme: { ...DEFAULT_THEME },
    webhookUrl: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from scratch with one empty step.",
    emoji: "✨",
    build: () => ({
      ...base("Untitled funnel"),
      steps: [{ id: uid(), name: "Step 1", blocks: [] }],
    }),
  },
  {
    id: "lead-magnet",
    name: "Lead Magnet",
    description: "Hook → value → email capture. The classic.",
    emoji: "🧲",
    build: () => ({
      ...base("Lead magnet funnel"),
      steps: [
        {
          id: uid(),
          name: "Hook",
          blocks: [
            {
              id: uid(),
              type: "image",
              src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80",
              alt: "Cover",
              rounded: true,
            },
            {
              id: uid(),
              type: "heading",
              text: "Steal the exact playbook we use to book 20+ calls a month",
              size: "lg",
              align: "center",
            },
            {
              id: uid(),
              type: "text",
              text: "Free 12-page guide. No fluff — just the system, the scripts, and the numbers.",
              align: "center",
            },
            { id: uid(), type: "button", label: "Get the free guide", action: "next", href: "" },
            {
              id: uid(),
              type: "rating",
              stars: 5,
              quote: "Implemented page 4 alone and got 9 leads in a week.",
              author: "Marcus T., Agency Owner",
            },
          ],
        },
        {
          id: uid(),
          name: "Capture",
          blocks: [
            {
              id: uid(),
              type: "heading",
              text: "Where should we send it?",
              size: "md",
              align: "center",
            },
            {
              id: uid(),
              type: "form",
              title: "",
              collectName: true,
              collectEmail: true,
              collectPhone: false,
              buttonLabel: "Send me the guide",
              successMessage: "Done! Check your inbox in the next 2 minutes. 📬",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "quiz",
    name: "Quiz Funnel",
    description: "Qualify leads with tappable questions, then capture.",
    emoji: "🎯",
    build: () => ({
      ...base("Quiz funnel"),
      steps: [
        {
          id: uid(),
          name: "Intro",
          blocks: [
            {
              id: uid(),
              type: "heading",
              text: "Find out what's leaking leads from your business",
              size: "lg",
              align: "center",
            },
            {
              id: uid(),
              type: "text",
              text: "Answer 2 quick questions — takes 30 seconds.",
              align: "center",
            },
            { id: uid(), type: "button", label: "Start the quiz", action: "next", href: "" },
          ],
        },
        {
          id: uid(),
          name: "Question 1",
          blocks: [
            {
              id: uid(),
              type: "choice",
              question: "How do most of your leads find you today?",
              options: [
                { id: uid(), emoji: "📣", label: "Referrals / word of mouth" },
                { id: uid(), emoji: "📱", label: "Social media" },
                { id: uid(), emoji: "💸", label: "Paid ads" },
                { id: uid(), emoji: "🤷", label: "Honestly, not sure" },
              ],
            },
          ],
        },
        {
          id: uid(),
          name: "Question 2",
          blocks: [
            {
              id: uid(),
              type: "choice",
              question: "What happens when a lead calls and you miss it?",
              options: [
                { id: uid(), emoji: "📞", label: "We call back same day" },
                { id: uid(), emoji: "⏳", label: "We get to it eventually" },
                { id: uid(), emoji: "🕳", label: "It probably falls through" },
              ],
            },
          ],
        },
        {
          id: uid(),
          name: "Results",
          blocks: [
            {
              id: uid(),
              type: "heading",
              text: "Your results are ready",
              size: "lg",
              align: "center",
            },
            {
              id: uid(),
              type: "text",
              text: "Drop your details and we'll send your personalized leak report.",
              align: "center",
            },
            {
              id: uid(),
              type: "form",
              title: "",
              collectName: true,
              collectEmail: true,
              collectPhone: true,
              buttonLabel: "Get my report",
              successMessage: "Report on the way! 🚀",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "booking",
    name: "Service Booking",
    description: "Pitch a service, show proof, capture the lead.",
    emoji: "📅",
    build: () => ({
      ...base("Service booking funnel"),
      steps: [
        {
          id: uid(),
          name: "Pitch",
          blocks: [
            {
              id: uid(),
              type: "heading",
              text: "Never miss another customer call",
              size: "xl",
              align: "center",
            },
            {
              id: uid(),
              type: "text",
              text: "We install an AI receptionist that answers, qualifies, and books jobs 24/7 — live in 7 days.",
              align: "center",
            },
            {
              id: uid(),
              type: "video",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            { id: uid(), type: "button", label: "See if it fits my business", action: "next", href: "" },
          ],
        },
        {
          id: uid(),
          name: "Qualify",
          blocks: [
            {
              id: uid(),
              type: "choice",
              question: "How many calls do you miss per week?",
              options: [
                { id: uid(), emoji: "1️⃣", label: "1–5 calls" },
                { id: uid(), emoji: "🔟", label: "5–15 calls" },
                { id: uid(), emoji: "🔥", label: "15+ — it's a problem" },
              ],
            },
          ],
        },
        {
          id: uid(),
          name: "Book",
          blocks: [
            {
              id: uid(),
              type: "heading",
              text: "Let's get you on the calendar",
              size: "md",
              align: "center",
            },
            {
              id: uid(),
              type: "rating",
              stars: 5,
              quote: "Paid for itself in the first 11 days. Wish we did it sooner.",
              author: "Dana K., HVAC Owner",
            },
            {
              id: uid(),
              type: "form",
              title: "",
              collectName: true,
              collectEmail: true,
              collectPhone: true,
              buttonLabel: "Request my slot",
              successMessage: "Got it — we'll text you within the hour. 📲",
            },
          ],
        },
      ],
    }),
  },
];
