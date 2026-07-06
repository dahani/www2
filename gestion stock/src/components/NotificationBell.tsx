import { useEffect, useRef, useState } from "react";
import { Bell, AlertTriangle, PackageX } from "lucide-react";
import type { Produit } from "../types";
import type { Page } from "../App";

interface NotificationBellProps {
  lowStockProduits: Produit[];
  setPage: (p: Page) => void;
}

export default function NotificationBell({ lowStockProduits, setPage }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const count = lowStockProduits.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Alertes stock</p>
            {count > 0 && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                {count} produit(s)
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {count === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">
                Aucune alerte. Tous les stocks sont suffisants ✅
              </p>
            ) : (
              lowStockProduits.map((p) => (
                <div key={p.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      p.quantite === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {p.quantite === 0 ? <PackageX className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{p.nom}</p>
                    <p className="text-xs text-slate-400">
                      Stock: <span className="font-semibold text-slate-600">{p.quantite}</span> / min {p.stockMin}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          {count > 0 && (
            <button
              onClick={() => {
                setPage("produits");
                setOpen(false);
              }}
              className="w-full rounded-b-2xl border-t border-slate-100 py-2.5 text-center text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
            >
              Voir tous les produits
            </button>
          )}
        </div>
      )}
    </div>
  );
}
