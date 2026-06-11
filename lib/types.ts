export type BlockType =
  | "heading"
  | "text"
  | "image"
  | "button"
  | "choice"
  | "form"
  | "video"
  | "rating"
  | "spacer";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  text: string;
  size: "xl" | "lg" | "md";
  align: "left" | "center";
}

export interface TextBlock extends BaseBlock {
  type: "text";
  text: string;
  align: "left" | "center";
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  rounded: boolean;
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  label: string;
  action: "next" | "link" | "call";
  href: string;
  phone?: string;
}

export interface ChoiceOption {
  id: string;
  emoji: string;
  label: string;
}

export interface ChoiceBlock extends BaseBlock {
  type: "choice";
  question: string;
  options: ChoiceOption[];
}

export interface FormBlock extends BaseBlock {
  type: "form";
  title: string;
  collectName: boolean;
  collectEmail: boolean;
  collectPhone: boolean;
  buttonLabel: string;
  successMessage: string;
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  url: string; // YouTube / Vimeo URL
}

export interface RatingBlock extends BaseBlock {
  type: "rating";
  stars: number;
  quote: string;
  author: string;
}

export interface SpacerBlock extends BaseBlock {
  type: "spacer";
  size: "sm" | "md" | "lg";
}

export type Block =
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | ChoiceBlock
  | FormBlock
  | VideoBlock
  | RatingBlock
  | SpacerBlock;

export interface Step {
  id: string;
  name: string;
  blocks: Block[];
}

export interface Theme {
  primary: string; // hex
  background: "light" | "dark" | "gradient";
  font: "sans" | "serif" | "mono";
}

export interface Funnel {
  id: string;
  name: string;
  steps: Step[];
  theme: Theme;
  webhookUrl: string;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_THEME: Theme = {
  primary: "#18181B",
  background: "light",
  font: "sans",
};

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
