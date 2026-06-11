import { Theme } from "./types";

export const PRIMARY_PRESETS = [
  "#18181B", // ink
  "#52525B", // grey
  "#2563EB", // blue
  "#0EA5E9", // sky
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#EC4899", // pink
];

export function themeStyles(theme: Theme) {
  const dark = theme.background === "dark";
  const fontFamily =
    theme.font === "serif"
      ? "Georgia, 'Times New Roman', serif"
      : theme.font === "mono"
        ? "ui-monospace, 'SF Mono', Menlo, monospace"
        : "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

  return {
    container: {
      fontFamily,
      color: dark ? "#F4F4F5" : "#18181B",
      background:
        theme.background === "gradient"
          ? `linear-gradient(160deg, ${theme.primary}14 0%, #ffffff 45%, ${theme.primary}0D 100%)`
          : dark
            ? "#101014"
            : "#FFFFFF",
    } as React.CSSProperties,
    muted: dark ? "#A1A1AA" : "#52525B",
    cardBg: dark ? "#1C1C22" : "#F8F8FA",
    cardBorder: dark ? "#2D2D35" : "#E8E8EC",
    inputBg: dark ? "#1C1C22" : "#FFFFFF",
    inputBorder: dark ? "#3F3F46" : "#D9D9DE",
    dark,
  };
}

export type VideoSource =
  | { kind: "embed"; src: string }
  | { kind: "file"; src: string }
  | null;

export function resolveVideo(url: string): VideoSource {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.match(/\/(shorts|embed)\/([\w-]+)/)?.[2];
      return id ? { kind: "embed", src: `https://www.youtube.com/embed/${id}` } : null;
    }
    if (u.hostname === "youtu.be") {
      return { kind: "embed", src: `https://www.youtube.com/embed/${u.pathname.slice(1)}` };
    }
    if (u.hostname.includes("vimeo.com")) {
      return { kind: "embed", src: `https://player.vimeo.com/video/${u.pathname.slice(1)}` };
    }
    if (u.hostname.includes("loom.com")) {
      const id = u.pathname.split("/").pop();
      return id ? { kind: "embed", src: `https://www.loom.com/embed/${id}` } : null;
    }
    // Anything else with a real URL — treat as a direct video file (mp4, webm, mov, CDN links)
    return { kind: "file", src: url };
  } catch {
    return null;
  }
}
