/**
 * Lightweight store for UI-only state that should survive page refresh:
 *  - theme preference
 *
 * All domain data (fournisseurs, clients, produits, ventes, credits,
 * appSettings) now lives in the Symfony 8 API and is fetched on demand.
 * No localStorage persistence for data.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "indigo" | "emerald" | "rose" | "violet" | "sky" | "amber";

interface UiState {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

export const useStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "indigo",
      setTheme: (t) => set({ theme: t }),
    }),
    {
      name: "stockpro-ui",        // small localStorage key — only theme
      partialize: (s) => ({ theme: s.theme }),
    }
  )
);
