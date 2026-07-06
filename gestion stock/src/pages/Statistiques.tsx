import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { TrendingUp, Package, Wallet, DollarSign, RefreshCw } from "lucide-react";
import { apiStats } from "../services/api";
import { useApi } from "../hooks/useApi";
import StatCard from "../components/StatCard";
import { LoadingBlock } from "../components/Spinner";
import { formatMAD } from "../utils/format";

export default function Statistiques() {
  const { data: stats, loading, error, refetch } = useApi(
    apiStats.get,
    [],
    { chiffreAffaires: 0, valeurStock: 0, creditsEnCours: 0, nbVentes: 0, nbProduits: 0, lowStock: [] }
  );

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Statistiques en temps réel</h2>
          <p className="text-xs text-slate-400 mt-0.5">Données chargées depuis le serveur à chaque visite.</p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {loading && <LoadingBlock label="Chargement des statistiques…" />}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">Erreur : {error}</p>}

      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Chiffre d'affaires" value={formatMAD(stats.chiffreAffaires)} icon={DollarSign} color="indigo" />
            <StatCard label="Ventes totales" value={String(stats.nbVentes)} icon={TrendingUp} color="emerald" sub={`${stats.nbProduits} produit(s) au catalogue`} />
            <StatCard label="Crédits en cours" value={formatMAD(stats.creditsEnCours)} icon={Wallet} color="red" />
            <StatCard label="Valeur du stock" value={formatMAD(stats.valeurStock)} icon={Package} color="sky" />
          </div>

          {/* Low-stock bar chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-1 font-semibold text-slate-800">Produits en alerte de stock</h3>
            <p className="mb-4 text-xs text-slate-400">Produits dont la quantité est ≤ au stock minimum configuré.</p>
            {stats.lowStock.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm text-slate-500">Aucune alerte — tous les stocks sont suffisants</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, stats.lowStock.length * 44)}>
                <BarChart data={stats.lowStock} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="nom" width={160} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip formatter={(v) => [`${v} unités`, "Stock actuel"]} />
                  <Bar dataKey="quantite" fill="#ef4444" radius={[0, 6, 6, 0]} name="Quantité" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Low stock table */}
          {stats.lowStock.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-3">
                <h3 className="font-semibold text-slate-800 text-sm">Détail des alertes ({stats.lowStock.length})</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-2 text-left">Produit</th>
                    <th className="px-5 py-2 text-left">Catégorie</th>
                    <th className="px-5 py-2 text-right">Stock min.</th>
                    <th className="px-5 py-2 text-right">Stock actuel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.lowStock.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-5 py-2.5 font-medium text-slate-800">{p.nom}</td>
                      <td className="px-5 py-2.5 text-slate-400">{p.categorie || "—"}</td>
                      <td className="px-5 py-2.5 text-right text-slate-500">{p.stockMin}</td>
                      <td className="px-5 py-2.5 text-right">
                        <span className={`font-bold ${p.quantite === 0 ? "text-red-600" : "text-amber-600"}`}>
                          {p.quantite === 0 ? "Rupture" : p.quantite}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
