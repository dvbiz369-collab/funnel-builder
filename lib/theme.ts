import { Theme } from "./types";

export const PRIMARY_PRESETS = [
  "#6356F6", // violet
  "#2563EB", // blue
  "#0EA5E9", // sky
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#EC4899", // pink
  "#111827", // ink
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

export function videoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video/${u.pathname.slice(1)}`;
    }
    return null;
  } catch {
    return null;
  }
}
