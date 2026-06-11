import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { Funnel } from "./types";

// The whole funnel travels inside the URL hash — no server, no database.
export function encodeFunnel(funnel: Funnel): string {
  return compressToEncodedURIComponent(JSON.stringify(funnel));
}

export function decodeFunnel(encoded: string): Funnel | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const funnel = JSON.parse(json) as Funnel;
    if (!funnel.steps || !Array.isArray(funnel.steps)) return null;
    return funnel;
  } catch {
    return null;
  }
}

export function publishUrl(funnel: Funnel): string {
  const base =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/f#${encodeFunnel(funnel)}`;
}
