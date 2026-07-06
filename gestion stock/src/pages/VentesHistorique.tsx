import { useEffect, useRef, useState } from "react";
import {
  Search,
  Loader2,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Printer,
  X,
  Receipt as ReceiptIcon,
} from "lucide-react";
import { useStore } from "../store/useStore";
import type { Vente, ModePaiement } from "../types";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import SubmitButton from "../components/SubmitButton";
import InvoicePrint from "../components/InvoicePrint";
import ClientSearchSelect from "../components/ClientSearchSelect";
import { useToast } from "../components/ToastProvider";
import { formatMAD, formatDateTime } from "../utils/format";
import { LoadingBlock } from "../components/Spinner";
import type { Client } from "../types";

const statutLabels: Record<string, string> = { payee: "Payée", partielle: "Partielle", impayee: "Impayée" };
const statutColors: Record<string, string> = {
  payee: "bg-emerald-50 text-emerald-600",
  partielle: "bg-amber-50 text-amber-600",
  impayee: "bg-red-50 text-red-600",
};
const paiementLabels: Record<ModePaiement, string> = { especes: "Espèces", credit: "Crédit", carte: "Carte bancaire" };

const SEARCH_DEBOUNCE_MS = 350;

export default function VentesHistorique() {
  const ventes = useStore((s) => s.ventes) ?? [];
  const loadVentes = useStore((s) => s.loadVentes);
  const updateVente = useStore((s) => s.updateVente);
  const deleteVente = useStore((s) => s.deleteVente);
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState<string>("");
  const [viewVente, setViewVente] = useState<Vente | null>(null);
  const [editVente, setEditVente] = useState<Vente | null>(null);
  const [toDelete, setToDelete] = useState<Vente | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchVentes() {
    setLoading(true);
    try {
      await loadVentes({ q: search || undefined, statut: statut || undefined });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Impossible de charger les ventes", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVentes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchVentes, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statut]);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher N° facture ou client..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-indigo-400" />}
        </div>
        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm outline-none focus:border-indigo-400"
        >
          <option value="">Tous les statuts</option>
          <option value="payee">Payée</option>
          <option value="partielle">Partielle</option>
          <option value="impayee">Impayée</option>
        </select>
        <button
          onClick={fetchVentes}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 sm:ml-auto"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Actualiser
        </button>
      </div>

      {loading && ventes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <LoadingBlock label="Chargement des ventes…" />
        </div>
      ) : ventes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <ReceiptIcon className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">Aucune vente trouvée</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Facture</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Paiement</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ventes.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-medium text-slate-800">{v.numero}</td>
                  <td className="px-5 py-3 text-slate-600">{v.clientNom}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDateTime(v.date)}</td>
                  <td className="px-5 py-3 text-slate-500">{paiementLabels[v.modePaiement]}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{formatMAD(v.total)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statutColors[v.statut]}`}>
                      {statutLabels[v.statut]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setViewVente(v)} title="Voir / imprimer" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditVente(v)} title="Modifier" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setToDelete(v)} title="Supprimer" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View / print modal */}
      <Modal open={!!viewVente} onClose={() => setViewVente(null)} title="Détails de la vente" size="md">
        {viewVente && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
              <InvoicePrint vente={viewVente} />
            </div>
            <div className="flex gap-2 no-print">
              <button
                onClick={() => setViewVente(null)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <X className="h-4 w-4" /> Fermer
              </button>
              <button
                onClick={handlePrint}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Printer className="h-4 w-4" /> Imprimer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      {editVente && (
        <EditVenteModal
          vente={editVente}
          onClose={() => setEditVente(null)}
          onSave={async (data) => {
            try {
              await updateVente(editVente.id, data);
              showToast("Vente mise à jour");
              setEditVente(null);
            } catch (err) {
              showToast(err instanceof Error ? err.message : "Une erreur est survenue", "error");
            }
          }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        message={`Voulez-vous vraiment supprimer la vente "${toDelete?.numero}" ? Le stock des produits sera restauré.`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) {
            try {
              await deleteVente(toDelete.id);
              showToast("Vente supprimée", "info");
            } catch (err) {
              showToast(err instanceof Error ? err.message : "Suppression impossible", "error");
            }
          }
          setToDelete(null);
        }}
      />
    </div>
  );
}

function EditVenteModal({
  vente,
  onClose,
  onSave,
}: {
  vente: Vente;
  onClose: () => void;
  onSave: (data: {
    clientId: string | null;
    clientNom: string;
    modePaiement: ModePaiement;
    montantPaye: number;
    discountPercent: number;
    discountAmount: number;
  }) => Promise<void>;
}) {
  const [client, setClient] = useState<Client | null>(
    vente.clientId ? ({ id: vente.clientId, nom: vente.clientNom, tel: "", email: "", addr: "", createdAt: "" } as Client) : null
  );
  const [modePaiement, setModePaiement] = useState<ModePaiement>(vente.modePaiement);
  const [montantPaye, setMontantPaye] = useState(String(vente.montantPaye));
  const [discountPercent, setDiscountPercent] = useState(String(vente.discountPercent));
  const [discountAmount, setDiscountAmount] = useState(String(vente.discountAmount));
  const [saving, setSaving] = useState(false);

  const sousTotal = vente.sousTotal;
  const dp = Math.min(Math.max(Number(discountPercent) || 0, 0), 100);
  const da = Math.max(Number(discountAmount) || 0, 0);
  const total = Math.max(sousTotal - (sousTotal * dp) / 100 - da, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        clientId: client?.id ?? null,
        clientNom: client?.nom ?? vente.clientNom,
        modePaiement,
        montantPaye: Math.min(Number(montantPaye) || 0, total),
        discountPercent: dp,
        discountAmount: da,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Modifier la vente ${vente.numero}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-400">
          Les articles de la vente ne peuvent pas être modifiés ici. Vous pouvez ajuster le client, la remise et le
          paiement.
        </p>

        {vente.type === "client" && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Client</span>
            <ClientSearchSelect value={client} onChange={setClient} onCreateNew={() => {}} />
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Remise %</span>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-indigo-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Remise (MAD)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-indigo-400"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Mode de paiement</span>
          <select
            value={modePaiement}
            onChange={(e) => setModePaiement(e.target.value as ModePaiement)}
            className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-indigo-400"
          >
            <option value="especes">Espèces</option>
            <option value="carte">Carte bancaire</option>
            <option value="credit">Crédit</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Montant payé (MAD)</span>
          <input
            type="number"
            min={0}
            max={total}
            step="0.01"
            value={montantPaye}
            onChange={(e) => setMontantPaye(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-indigo-400"
          />
        </label>

        <div className="rounded-lg bg-slate-50 p-3 flex items-center justify-between text-sm">
          <span className="text-slate-500">Nouveau total</span>
          <span className="text-lg font-bold text-slate-900">{formatMAD(total)}</span>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            Annuler
          </button>
          <SubmitButton type="submit" loading={saving}>
            Enregistrer
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
