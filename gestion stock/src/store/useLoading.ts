import { create } from "zustand";

interface LoadingState {
  /** Number of concurrent pending API requests. */
  pending: number;
  /** Human-readable label of the last started request (optional). */
  lastLabel?: string;
  start: (label?: string) => void;
  stop: () => void;
}

/**
 * Global loading counter shared by the API service and UI components.
 * Any component can read `pending > 0` to display a loading indicator.
 */
export const useLoading = create<LoadingState>((set) => ({
  pending: 0,
  lastLabel: undefined,
  start: (label) =>
    set((s) => ({ pending: s.pending + 1, lastLabel: label ?? s.lastLabel })),
  stop: () =>
    set((s) => {
      const next = Math.max(0, s.pending - 1);
      return { pending: next, lastLabel: next === 0 ? undefined : s.lastLabel };
    }),
}));
