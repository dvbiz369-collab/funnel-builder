import { Block, BlockType, uid } from "./types";

export const BLOCK_META: Record<
  BlockType,
  { label: string; icon: string; hint: string }
> = {
  heading: { label: "Heading", icon: "T", hint: "Big bold title" },
  text: { label: "Text", icon: "¶", hint: "Paragraph copy" },
  image: { label: "Image", icon: "🖼", hint: "Photo or logo" },
  button: { label: "Button", icon: "▢", hint: "Next step or link" },
  choice: { label: "Quiz Choice", icon: "◉", hint: "Tappable options" },
  form: { label: "Lead Form", icon: "✉", hint: "Capture name / email / phone" },
  video: { label: "Video", icon: "▶", hint: "YouTube or Vimeo embed" },
  rating: { label: "Social Proof", icon: "★", hint: "Stars + testimonial" },
  calendly: { label: "Calendly", icon: "📅", hint: "Embedded booking calendar" },
  spacer: { label: "Spacer", icon: "⎯", hint: "Vertical space" },
};

export function newBlock(type: BlockType): Block {
  const id = uid();
  switch (type) {
    case "heading":
      return { id, type, text: "Your headline here", size: "lg", align: "center" };
    case "text":
      return {
        id,
        type,
        text: "Add supporting copy that moves people to the next step.",
        align: "center",
      };
    case "image":
      return {
        id,
        type,
        src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80",
        alt: "Image",
        rounded: true,
      };
    case "button":
      return { id, type, label: "Continue", action: "next", href: "" };
    case "choice":
      return {
        id,
        type,
        question: "What describes you best?",
        options: [
          { id: uid(), emoji: "🚀", label: "Just getting started" },
          { id: uid(), emoji: "📈", label: "Growing my business" },
          { id: uid(), emoji: "🏆", label: "Already established" },
        ],
      };
    case "form":
      return {
        id,
        type,
        title: "Where should we send it?",
        collectName: true,
        collectEmail: true,
        collectPhone: false,
        buttonLabel: "Get access",
        successMessage: "You're in! Check your inbox. 🎉",
        successAction: "message",
        successHref: "",
      };
    case "video":
      return { id, type, url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" };
    case "rating":
      return {
        id,
        type,
        stars: 5,
        quote: "This changed how we get clients. Booked solid in 2 weeks.",
        author: "Jamie R., Studio Owner",
      };
    case "calendly":
      return { id, type, url: "" };
    case "spacer":
      return { id, type, size: "md" };
  }
}
