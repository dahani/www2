import { useEffect, useRef, useState } from "react";
import { applyTheme } from "./theme/themes";
import Sidebar, { SidebarContent } from "./components/Sidebar";
import NotificationBell from "./components/NotificationBell";
import ToastProvider from "./components/ToastProvider";
import LoadingBar from "./components/LoadingBar";
import HeaderLoadingBadge from "./components/HeaderLoadingBadge";
import { useStore } from "./store/useStore";
import Dashboard from "./pages/Dashboard";
import Ventes from "./pages/Ventes";
import Produits from "./pages/Produits";
import Clients from "./pages/Clients";
import Fournisseurs from "./pages/Fournisseurs";
import Credits from "./pages/Credits";
import Statistiques from "./pages/Statistiques";
import Settings from "./pages/Settings";
import { Menu, X } from "lucide-react";
import { useApi } from "./hooks/useApi";
import { apiStats } from "./services/api";
import type { Produit } from "./types";

export type Page =
  | "dashboard"
  | "ventes"
  | "produits"
  | "clients"
  | "fournisseurs"
  | "credits"
  | "statistiques"
  | "parametres";

const pageTitles: Record<Page, string> = {
  dashboard:    "Tableau de bord",
  ventes:       "Point de vente",
  produits:     "Gestion des produits",
  clients:      "Gestion des clients",
  fournisseurs: "Gestion des fournisseurs",
  credits:      "Gestion des crédits",
  statistiques: "Statistiques",
  parametres:   "Paramètres",
};

function AppContent() {
  const [page, setPage] = useState<Page>("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useStore((s) => s.theme);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => { applyTheme(theme); }, [theme]);

  // Scroll to top on page change
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // Close drawer on resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setDrawerOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const { data: statsData } = useApi(
    apiStats.get,
    [page],
    { chiffreAffaires: 0, valeurStock: 0, creditsEnCours: 0, nbVentes: 0, nbProduits: 0, lowStock: [] as Produit[] }
  );
  const lowStockProduits: Produit[] = statsData.lowStock;

  function navigate(p: Page) {
    setPage(p);
    setDrawerOpen(false);
  }

  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "var(--app-bg, #f8fafc)" }}
    >
      {/* ── Desktop sidebar (always visible ≥ md) ─────────────── */}
      <Sidebar page={page} setPage={navigate} lowStockCount={lowStockProduits.length} />

      {/* ── Mobile drawer overlay ───────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel — slides in from the left */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col md:hidden transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button inside the drawer header */}
        <div
          className="relative flex-1 flex flex-col h-full"
        >
          {/* The full sidebar content — same as desktop */}
          <SidebarContent
            page={page}
            setPage={navigate}
            lowStockCount={lowStockProduits.length}
          />

          {/* ✕ close button — top-right corner of the drawer */}
          <button
            onClick={() => setDrawerOpen(false)}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        <header
          className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 backdrop-blur px-4 md:px-8 py-3 md:py-4"
          style={{ background: "var(--app-header-bg, rgba(255,255,255,0.95))" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 active:scale-95 transition"
              onClick={() => setDrawerOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-bold text-slate-900 truncate">
                {pageTitles[page]}
              </h1>
              <p className="text-xs text-slate-400 hidden md:block">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <HeaderLoadingBadge />
            <NotificationBell lowStockProduits={lowStockProduits} setPage={navigate} />
          </div>
        </header>

        <main ref={mainRef} className="flex-1 p-3 md:p-8">
          {page === "dashboard"     && <Dashboard setPage={navigate} />}
          {page === "ventes"        && <Ventes />}
          {page === "produits"      && <Produits />}
          {page === "clients"       && <Clients />}
          {page === "fournisseurs"  && <Fournisseurs />}
          {page === "credits"       && <Credits />}
          {page === "statistiques"  && <Statistiques />}
          {page === "parametres"    && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <LoadingBar />
      <AppContent />
    </ToastProvider>
  );
}
