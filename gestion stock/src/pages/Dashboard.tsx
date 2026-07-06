import { DollarSign, ShoppingBag, AlertTriangle, Wallet, ArrowRight, PackageX, Receipt, RefreshCw } from "lucide-react";
import type { Page } from "../App";
import type { Vente } from "../types";
import { apiStats, apiVentes } from "../services/api";
import { useApi } from "../hooks/useApi";
import StatCard from "../components/StatCard";
import { LoadingBlock } from "../components/Spinner";
import { formatMAD, formatDateTime } from "../utils/format";

const paiementLabels: Record<string, string> = { especes: "Espèces", credit: "Crédit", carte: "Carte" };
const statutColors: Record<string, string> = {
  payee: "bg-emerald-50 text-emerald-700",
  partielle: "bg-amber-50 text-amber-700",
  impayee: "bg-red-50 text-red-700",
};
const statutLabels: Record<string, string> = { payee: "Payée", partielle: "Partielle", impayee: "Impayée" };

export default function Dashboard({ setPage }: { setPage: (p: Page) => void }) {
  const { data: stats, loading: loadingStats, error: errorStats, refetch: refetchStats } = useApi(
    apiStats.get,
    [],
    { chiffreAffaires: 0, valeurStock: 0, creditsEnCours: 0, nbVentes: 0, nbProduits: 0, lowStock: [] }
  );

  // Load last 6 ventes for the "Ventes récentes" panel
  const { data: ventesData, loading: loadingVentes, refetch: refetchVentes } = useApi(
    () => apiVentes.list(1, 6),
    [],
    { data: [] as Vente[], total: 0 }
  );

  const recentVentes: Vente[] = ventesData.data;

  function handleRefresh() {
    refetchStats();
    refetchVentes();
  }

  if (loadingStats && loadingVentes) return <LoadingBlock label="Chargement du tableau de bord…" />;
  if (errorStats) return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">Erreur : {errorStats}</p>;

  const { chiffreAffaires, creditsEnCours, nbVentes, nbProduits, lowStock } = stats;

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleRefresh}
          disabled={loadingStats || loadingVentes}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${(loadingStats || loadingVentes) ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Chiffre d'affaires total" value={formatMAD(chiffreAffaires)} icon={DollarSign} color="indigo" sub={`${nbVentes} vente(s)`} />
        <StatCard label="Produits au catalogue" value={String(nbProduits)} icon={ShoppingBag} color="emerald" sub="Tous les produits" />
        <StatCard label="Alertes stock" value={String(lowStock.length)} icon={AlertTriangle} color="amber" sub="Produits sous le seuil min." />
        <StatCard label="Crédits en cours" value={formatMAD(creditsEnCours)} icon={Wallet} color="red" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent ventes */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 className="font-semibold text-slate-800">Ventes récentes</h3>
            <button
              onClick={() => setPage("ventes")}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Voir tout <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {loadingVentes ? (
            <LoadingBlock label="Chargement…" />
          ) : recentVentes.length === 0 ? (
            <div className="py-16 text-center">
              <Receipt className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">Aucune vente enregistrée</p>
              <button
                onClick={() => setPage("ventes")}
                className="mt-3 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Créer une vente
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentVentes.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      <span className="font-mono text-indigo-600 mr-2">{v.numero}</span>
                      {v.clientNom}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDateTime(v.date)} · {paiementLabels[v.modePaiement] ?? v.modePaiement} · {v.items.length} article(s)
                    </p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-sm font-bold text-slate-800">{formatMAD(v.total)}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statutColors[v.statut] ?? ""}`}>
                      {statutLabels[v.statut] ?? v.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 className="font-semibold text-slate-800">Alertes de stock</h3>
            <button
              onClick={() => setPage("produits")}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Gérer <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {loadingStats ? (
            <LoadingBlock label="Chargement…" />
          ) : lowStock.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl">✅</p>
              <p className="mt-3 text-sm text-slate-500">Tous les stocks sont suffisants</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${p.quantite === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                    {p.quantite === 0 ? <PackageX className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.nom}</p>
                    <p className="text-xs text-slate-400">Seuil min: {p.stockMin}</p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${p.quantite === 0 ? "text-red-600" : "text-amber-600"}`}>
                    {p.quantite === 0 ? "Rupture" : p.quantite}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
