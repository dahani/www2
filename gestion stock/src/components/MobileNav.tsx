import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Wallet,
} from "lucide-react";
import type { Page } from "../App";

interface MobileNavProps {
  page: Page;
  setPage: (p: Page) => void;
}

const items: { key: Page; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Accueil", icon: LayoutDashboard },
  { key: "ventes", label: "Ventes", icon: ShoppingCart },
  { key: "produits", label: "Produits", icon: Package },
  { key: "clients", label: "Clients", icon: Users },
  { key: "credits", label: "Crédits", icon: Wallet },
];

export default function MobileNav({ page, setPage }: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex justify-around border-t border-slate-200 bg-white/95 backdrop-blur px-1 py-1.5 no-print">
      {items.map((item) => {
        const Icon = item.icon;
        const active = page === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setPage(item.key)}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium ${
              active ? "text-indigo-600" : "text-slate-400"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
