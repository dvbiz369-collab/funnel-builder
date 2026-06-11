import { Funnel } from "./types";

const KEY = "funnels.v1";

export function listFunnels(): Funnel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Funnel[];
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function getFunnel(id: string): Funnel | null {
  return listFunnels().find((f) => f.id === id) ?? null;
}

export function saveFunnel(funnel: Funnel): void {
  const all = listFunnels().filter((f) => f.id !== funnel.id);
  all.push({ ...funnel, updatedAt: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteFunnel(id: string): void {
  localStorage.setItem(
    KEY,
    JSON.stringify(listFunnels().filter((f) => f.id !== id))
  );
}
