import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  Wallet,
  BarChart3,
  Boxes,
  Settings as SettingsIcon,
} from "lucide-react";
import type { Page } from "../App";

interface SidebarProps {
  page: Page;
  setPage: (p: Page) => void;
  lowStockCount: number;
}

export const navItems: { key: Page; label: string; icon: React.ElementType }[] = [
  { key: "dashboard",    label: "Tableau de bord",       icon: LayoutDashboard },
  { key: "ventes",       label: "Point de vente",         icon: ShoppingCart },
  { key: "produits",     label: "Produits",               icon: Package },
  { key: "clients",      label: "Clients",                icon: Users },
  { key: "fournisseurs", label: "Fournisseurs",           icon: Truck },
  { key: "credits",      label: "Crédits",                icon: Wallet },
  { key: "statistiques", label: "Statistiques",           icon: BarChart3 },
  { key: "parametres",   label: "Paramètres",             icon: SettingsIcon },
];

/** Inner content — used by both the desktop sidebar and the mobile drawer. */
export function SidebarContent({ page, setPage, lowStockCount }: SidebarProps) {
  return (
    <div
      className="flex h-full flex-col no-print transition-all duration-300"
      style={{ background: "var(--sidebar-bg, linear-gradient(160deg,#312e81,#4338ca))" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5 shrink-0"
        style={{ borderBottom: "1px solid var(--sidebar-border, rgba(255,255,255,0.1))" }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur shadow-lg">
          <Boxes className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight tracking-wide">StockPro</p>
          <p className="text-[11px] leading-tight" style={{ color: "var(--sidebar-text, rgba(199,210,254,0.8))" }}>
            Gestion Stock &amp; Ventes
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150"
              style={
                active
                  ? {
                      background: "var(--sidebar-active-bg, rgba(255,255,255,0.15))",
                      color: "var(--sidebar-active-text, #fff)",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
                    }
                  : {
                      background: "transparent",
                      color: "var(--sidebar-text, rgba(199,210,254,0.85))",
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLElement).style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--sidebar-text, rgba(199,210,254,0.85))";
                }
              }}
            >
              <span className="flex items-center gap-3">
                <Icon
                  className="h-[18px] w-[18px] shrink-0 transition-colors"
                  style={{
                    color: active
                      ? "var(--sidebar-active-text, #fff)"
                      : "var(--sidebar-icon, rgba(165,180,252,0.9))",
                  }}
                />
                {item.label}
              </span>
              {item.key === "produits" && lowStockCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                  {lowStockCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="shrink-0 px-5 py-4"
        style={{ borderTop: "1px solid var(--sidebar-border, rgba(255,255,255,0.1))" }}
      >
        <p className="text-[11px]" style={{ color: "var(--sidebar-text, rgba(199,210,254,0.6))" }}>
          © {new Date().getFullYear()} StockPro
        </p>
      </div>
    </div>
  );
}

/** Desktop sidebar — fixed left column, hidden on mobile. */
export default function Sidebar({ page, setPage, lowStockCount }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col no-print">
      <SidebarContent page={page} setPage={setPage} lowStockCount={lowStockCount} />
    </aside>
  );
}
