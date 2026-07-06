import { useMemo, useState } from "react";
import {
  Wallet, Search, PlusCircle, CheckCircle2, History, Receipt,
  Banknote, CreditCard, FileCheck,
} from "lucide-react";
import Pagination, { type PageSize } from "../components/Pagination";
import type { Credit, TypePaiementCredit } from "../types";
import { apiCredits } from "../services/api";
import { useApi } from "../hooks/useApi";
import { useSaving } from "../hooks/useSaving";
import Modal from "../components/Modal";
import SaveButton from "../components/SaveButton";
import { LoadingBlock } from "../components/Spinner";
import { useToast } from "../components/ToastProvider";
import { formatMAD, formatDateTime } from "../utils/format";

const TYPE_PAIEMENT_OPTIONS: { value: TypePaiementCredit; label: string; icon: React.ElementType }[] = [
  { value: "especes",  label: "Espèces",       icon: Banknote },
  { value: "cheque",   label: "Chèque",         icon: FileCheck },
  { value: "carte",    label: "Carte bancaire", icon: CreditCard },
];

const typePaiementLabel: Record<TypePaiementCredit, string> = {
  especes: "Espèces",
  cheque:  "Chèque",
  carte:   "Carte",
};

export default function Credits() {
  const { data: credits, loading, error, refetch } = useApi(apiCredits.list, [], [] as Credit[]);
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ouvert" | "solde" | "tous">("ouvert");
  const [payModal, setPayModal] = useState<Credit | null>(null);
  const [historyModal, setHistoryModal] = useState<Credit | null>(null);
  const [montant, setMontant] = useState("");
  const [typePaiement, setTypePaiement] = useState<TypePaiementCredit>("especes");
  const [note, setNote] = useState("");
  const [saving, runSave] = useSaving();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);

  const typedCredits = credits;

  const totalEnCours = useMemo(
    () => typedCredits.filter((c) => c.statut === "ouvert").reduce((s, c) => s + (c.montantTotal - c.montantPaye), 0),
    [typedCredits]
  );

  const allFiltered = useMemo(() => {
    const q = search.toLowerCase();
    return typedCredits
      .filter((c) => c.clientNom.toLowerCase().includes(q) || c.venteNumero.toLowerCase().includes(q))
      .filter((c) => (filter === "tous" ? true : c.statut === filter))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [typedCredits, search, filter]);

  const totalCredits = allFiltered.length;
  const totalPagesCred = Math.max(1, Math.ceil(totalCredits / pageSize));
  const filtered = useMemo(
    () => allFiltered.slice((page - 1) * pageSize, page * pageSize),
    [allFiltered, page, pageSize]
  );

  function openPayModal(c: Credit) {
    setPayModal(c);
    setMontant("");
    setTypePaiement("especes");
    setNote("");
  }

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!payModal) return;
    const m = Number(montant);
    const reste = payModal.montantTotal - payModal.montantPaye;
    if (!m || m <= 0 || m > reste) { showToast("Montant invalide", "error"); return; }
    runSave(async () => {
      await apiCredits.addPaiement(payModal.id, m, typePaiement, note || undefined);
      showToast("Paiement enregistré");
      setPayModal(null);
      refetch();
    });
  }

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-slate-400">Total crédits en cours</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{formatMAD(totalEnCours)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-slate-400">Crédits ouverts</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{typedCredits.filter((c) => c.statut === "ouvert").length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-slate-400">Crédits soldés</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{typedCredits.filter((c) => c.statut === "solde").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher client ou N° facture…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1 w-fit">
          {(["ouvert", "solde", "tous"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filter === f ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {f === "ouvert" ? "Ouverts" : f === "solde" ? "Soldés" : "Tous"}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingBlock label="Chargement des crédits…" />}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">Erreur : {error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Wallet className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">Aucun crédit trouvé</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Facture</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payé</th>
                <th className="px-5 py-3">Reste</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => {
                const reste = c.montantTotal - c.montantPaye;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-medium text-slate-800">{c.clientNom}</td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><Receipt className="h-3.5 w-3.5 text-slate-400" />{c.venteNumero}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(c.date)}</td>
                    <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatMAD(c.montantTotal)}</td>
                    <td className="px-5 py-3 text-emerald-600 whitespace-nowrap">{formatMAD(c.montantPaye)}</td>
                    <td className="px-5 py-3 font-semibold text-red-600 whitespace-nowrap">{formatMAD(reste)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.statut === "solde" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                        {c.statut === "solde" ? "Soldé" : "Ouvert"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setHistoryModal(c)} title="Historique" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                          <History className="h-4 w-4" />
                        </button>
                        {c.statut === "ouvert" && (
                          <button onClick={() => openPayModal(c)} title="Ajouter paiement" className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600">
                            <PlusCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalCredits > 0 && (
        <Pagination
          page={page}
          totalPages={totalPagesCred}
          total={totalCredits}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          label="crédit(s)"
        />
      )}

      {/* Payment modal */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Enregistrer un paiement" size="sm">
        {payModal && (
          <form onSubmit={handlePay} className="space-y-4">
            {/* Summary */}
            <div className="rounded-xl bg-slate-50 p-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Client</span>
                <span className="font-semibold text-slate-800">{payModal.clientNom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total crédit</span>
                <span className="font-semibold text-slate-800">{formatMAD(payModal.montantTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Déjà payé</span>
                <span className="font-semibold text-emerald-600">{formatMAD(payModal.montantPaye)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                <span className="text-slate-500">Reste à payer</span>
                <span className="font-bold text-red-600">{formatMAD(payModal.montantTotal - payModal.montantPaye)}</span>
              </div>
            </div>

            {/* Type paiement */}
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Mode de paiement</p>
              <div className="grid grid-cols-3 gap-2">
                {TYPE_PAIEMENT_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTypePaiement(value)}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 text-xs font-semibold transition ${
                      typePaiement === value
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Montant */}
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Montant à encaisser (MAD)</span>
              <input
                type="number"
                step="0.01"
                min={0.01}
                max={payModal.montantTotal - payModal.montantPaye}
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                autoFocus
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            {/* Note optionnelle */}
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Note (optionnel)</span>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Numéro de chèque, référence…"
                className="w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <SaveButton saving={saving} label="Valider le paiement" savingLabel="Enregistrement…" variant="success" fullWidth icon={CheckCircle2} />
          </form>
        )}
      </Modal>

      {/* History modal */}
      <Modal open={!!historyModal} onClose={() => setHistoryModal(null)} title="Historique des paiements" size="sm">
        {historyModal && (
          <div className="space-y-2">
            {historyModal.paiements.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Aucun paiement enregistré</p>
            ) : (
              historyModal.paiements.map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{formatMAD(p.montant)}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(p.date)}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {typePaiementLabel[p.typePaiement] ?? p.typePaiement}
                    </span>
                    {p.note && <p className="mt-0.5 text-xs text-slate-400">{p.note}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
