import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, ScanLine, Plus, Minus, Trash2, ShoppingCart, User, Store,
  Banknote, CreditCard, Wallet, Printer, X, UserPlus, Receipt,
  Percent, Tag, List, Eye, AlertTriangle, Loader2, TrendingUp,
} from "lucide-react";
import Pagination, { type PageSize } from "../components/Pagination";
import type { Produit, VenteItem, ModePaiement, TypeVente, Vente, Client, AppSettings } from "../types";
import { apiProduits, apiClients, apiVentes, apiSettings, apiTopProduits } from "../services/api";
import { useHardwareScanner } from "../hooks/useHardwareScanner";
import { useApi } from "../hooks/useApi";
import { useSaving } from "../hooks/useSaving";
import BarcodeScanner from "../components/BarcodeScanner";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import InvoicePrint from "../components/InvoicePrint";
import SaveButton from "../components/SaveButton";
import { LoadingBlock } from "../components/Spinner";
import { useToast } from "../components/ToastProvider";
import { formatMAD, formatDateTime } from "../utils/format";

const defaultSettings: AppSettings = { nom: "StockPro", tel: "", addr: "", email: "", ice: "" };

const paiementLabels: Record<string, string> = { especes: "Espèces", credit: "Crédit", carte: "Carte" };
const paiementColors: Record<string, string> = { especes: "bg-emerald-50 text-emerald-600", credit: "bg-amber-50 text-amber-600", carte: "bg-sky-50 text-sky-600" };
const statutColors: Record<string, string> = { payee: "bg-emerald-50 text-emerald-700", partielle: "bg-amber-50 text-amber-700", impayee: "bg-red-50 text-red-700" };
const statutLabels: Record<string, string> = { payee: "Payée", partielle: "Partielle", impayee: "Impayée" };

type TabView = "pos" | "liste";

export default function Ventes() {
  const [tab, setTab] = useState<TabView>("pos");

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        <button
          onClick={() => setTab("pos")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "pos" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <ShoppingCart className="h-4 w-4" /> Point de vente
        </button>
        <button
          onClick={() => setTab("liste")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "liste" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <List className="h-4 w-4" /> Historique des ventes
        </button>
      </div>

      {tab === "pos" ? <POSView /> : <VentesListView />}
    </div>
  );
}

/* ─────────────────────────── LISTE DES VENTES ─────────────────────────── */
function VentesListView() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const { data, loading, error, refetch } = useApi(
    () => apiVentes.list(page, pageSize),
    [page, pageSize],
    { data: [] as Vente[], total: 0 }
  );
  const { showToast } = useToast();
  const { data: settings } = useApi(apiSettings.get, [], defaultSettings);
  const [viewVente, setViewVente] = useState<Vente | null>(null);
  const [toDelete, setToDelete] = useState<Vente | null>(null);
  const [search, setSearch] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const tableTopRef = useRef<HTMLDivElement>(null);

  // Scroll to top of table on page change
  useEffect(() => {
    tableTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  const ventes: Vente[] = data.data;
  const total: number = data.total;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? ventes.filter((v) => v.numero.toLowerCase().includes(q) || v.clientNom.toLowerCase().includes(q))
      : ventes;
  }, [ventes, search]);

  return (
    <div className="space-y-4">
      <div ref={tableTopRef} />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="N° facture, client…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button onClick={() => { setPage(1); refetch(); }} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Actualiser
        </button>
      </div>

      {loading && <LoadingBlock label="Chargement des ventes…" />}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">Erreur : {error}</p>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3">N° Facture</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Paiement</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">Aucune vente trouvée</td></tr>
                )}
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-mono font-semibold text-indigo-600">{v.numero}</td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(v.date)}</td>
                    <td className="px-5 py-3 text-slate-700">{v.clientNom}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${paiementColors[v.modePaiement] ?? ""}`}>
                        {paiementLabels[v.modePaiement] ?? v.modePaiement}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatMAD(v.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statutColors[v.statut] ?? ""}`}>
                        {statutLabels[v.statut] ?? v.statut}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setViewVente(v)} title="Voir la facture" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                          <Eye className="h-4 w-4" />
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

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            label="vente(s)"
          />
        </>
      )}

      {/* View invoice modal */}
      <Modal open={!!viewVente} onClose={() => setViewVente(null)} title="Détail de la vente" size="md">
        {viewVente && (
          <div className="space-y-4">
            {/* Items detail */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-2 text-left">Article</th>
                    <th className="px-4 py-2 text-center">Qté</th>
                    <th className="px-4 py-2 text-right">P.U</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewVente.items.map((it) => (
                    <tr key={it.produitId}>
                      <td className="px-4 py-2 text-slate-700">{it.nom}</td>
                      <td className="px-4 py-2 text-center text-slate-500">{it.quantite}</td>
                      <td className="px-4 py-2 text-right text-slate-500">{formatMAD(it.prix)}</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-800">{formatMAD(it.prix * it.quantite)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 space-y-1 text-sm">
              {(viewVente.discountPercent > 0 || viewVente.discountAmount > 0) && (
                <>
                  <div className="flex justify-between text-slate-500"><span>Sous-total</span><span>{formatMAD(viewVente.sousTotal)}</span></div>
                  {viewVente.discountPercent > 0 && <div className="flex justify-between text-emerald-600"><span>Remise ({viewVente.discountPercent}%)</span><span>-{formatMAD(viewVente.sousTotal * viewVente.discountPercent / 100)}</span></div>}
                  {viewVente.discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Remise (MAD)</span><span>-{formatMAD(viewVente.discountAmount)}</span></div>}
                </>
              )}
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1"><span>Total</span><span>{formatMAD(viewVente.total)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Payé</span><span className="text-emerald-600">{formatMAD(viewVente.montantPaye)}</span></div>
              {viewVente.reste > 0 && <div className="flex justify-between font-semibold text-red-600"><span>Reste (crédit)</span><span>{formatMAD(viewVente.reste)}</span></div>}
            </div>
            <div className="no-print rounded-xl border border-slate-100 bg-slate-50 p-2 hidden">
              <InvoicePrint ref={printRef} vente={viewVente} settings={settings} />
            </div>
            <div className="flex gap-2 no-print">
              <button onClick={() => setViewVente(null)} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <X className="h-4 w-4" /> Fermer
              </button>
              <button onClick={() => window.print()} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                <Printer className="h-4 w-4" /> Imprimer
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Supprimer la vente ?"
        message={`Supprimer la vente ${toDelete?.numero} (${formatMAD(toDelete?.total ?? 0)}) ? Cette action est irréversible.`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) {
            await apiVentes.delete(toDelete.id);
            showToast("Vente supprimée", "info");
            refetch();
          }
          setToDelete(null);
        }}
      />
    </div>
  );
}

/* ─────────────────────────── POINT DE VENTE ─────────────────────────── */
function POSView() {
  const { data: clientsAll, refetch: refetchClients } = useApi(apiClients.list, [], [] as Client[]);
  const { data: settings } = useApi(apiSettings.get, [], defaultSettings);
  // Top-sold products shown when no search
  const { data: topProduits } = useApi(apiTopProduits.get, [], [] as Produit[]);
  const { showToast } = useToast();

  // AJAX search state
  const [search, setSearch] = useState("");
  const [ajaxProduits, setAjaxProduits] = useState<Produit[] | null>(null);
  const [ajaxLoading, setAjaxLoading] = useState(false);
  const ajaxDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handlePOSSearch(val: string) {
    setSearch(val);
    if (ajaxDebounce.current) clearTimeout(ajaxDebounce.current);
    if (!val.trim()) { setAjaxProduits(null); return; }
    setAjaxLoading(true);
    ajaxDebounce.current = setTimeout(async () => {
      try {
        const res = await apiProduits.list(1, 40, val.trim(), "");
        setAjaxProduits(res.data);
      } catch { /* ignore */ } finally { setAjaxLoading(false); }
    }, 250);
  }

  // Displayed products: ajax results if searching, else top-sold
  const displayedProduits = search.trim() ? (ajaxProduits ?? []) : topProduits;
  const showTopHeader = !search.trim();

  const [scannerOpen, setScannerOpen] = useState(false);
  const [cart, setCart] = useState<VenteItem[]>([]);
  const [venteType, setVenteType] = useState<TypeVente>("comptoir");
  const [clientId, setClientId] = useState("");
  const [modePaiement, setModePaiement] = useState<ModePaiement>("especes");
  const [montantPayeInput, setMontantPayeInput] = useState("");
  const [discountPercentInput, setDiscountPercentInput] = useState("");
  const [discountAmountInput, setDiscountAmountInput] = useState("");
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [quickClient, setQuickClient] = useState({ nom: "", tel: "", email: "", addr: "" });
  const [lastVente, setLastVente] = useState<Vente | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [saving, runSave] = useSaving();
  const typedClients = clientsAll;

  // Hardware barcode scanner — listens to physical scanner keyboard events
  useHardwareScanner(async (code) => {
    setSearch(code);
    setAjaxLoading(true);
    try {
      const res = await apiProduits.list(1, 1, code, "");
      if (res.data.length === 1) {
        addToCart(res.data[0]);
        showToast(`"${res.data[0].nom}" ajouté au panier`, "success");
        setSearch(""); setAjaxProduits(null);
      } else if (res.data.length > 1) {
        setAjaxProduits(res.data);
        showToast(`${res.data.length} produits trouvés pour "${code}"`, "info");
      } else {
        showToast(`Aucun produit pour le code "${code}"`, "error");
      }
    } catch { /* ignore */ } finally { setAjaxLoading(false); }
  }, !quickClientOpen && !scannerOpen && !lastVente); // pause when modal open

  const filteredProduits = displayedProduits; // alias kept for the render below

  const sousTotal = useMemo(() => cart.reduce((s, it) => s + it.prix * it.quantite, 0), [cart]);
  const discountPercent = Math.min(Math.max(Number(discountPercentInput) || 0, 0), 100);
  const discountAmount = Math.max(Number(discountAmountInput) || 0, 0);
  const montantRemise = (sousTotal * discountPercent) / 100;
  const total = Math.max(sousTotal - montantRemise - discountAmount, 0);
  const selectedClient = typedClients.find((c) => c.id === clientId);

  function addToCart(p: Produit) {
    if (p.quantite <= 0) { showToast(`Stock épuisé pour "${p.nom}"`, "error"); return; }
    setCart((prev) => {
      const ex = prev.find((it) => it.produitId === p.id);
      if (ex) {
        if (ex.quantite + 1 > p.quantite) { showToast("Stock insuffisant", "error"); return prev; }
        return prev.map((it) => it.produitId === p.id ? { ...it, quantite: it.quantite + 1 } : it);
      }
      return [...prev, { produitId: p.id, nom: p.nom, codeBarre: p.codeBarre ?? "", prix: p.prix, quantite: 1 }];
    });
  }

  function updateQty(produitId: string, delta: number) {
    setCart((prev) => prev.map((it) => {
      if (it.produitId !== produitId) return it;
      const stock = displayedProduits.find((p: Produit) => p.id === produitId)?.quantite ?? 999;
      const newQty = it.quantite + delta;
      if (delta > 0 && newQty > stock) { showToast("Stock insuffisant", "error"); return it; }
      return { ...it, quantite: newQty };
    }).filter((it) => it.quantite > 0));
  }

  function resetSale() {
    setCart([]); setClientId(""); setVenteType("comptoir"); setModePaiement("especes");
    setMontantPayeInput(""); setDiscountPercentInput(""); setDiscountAmountInput("");
  }

  async function handleCreateQuickClient(e: React.FormEvent) {
    e.preventDefault();
    if (!quickClient.nom.trim()) { showToast("Le nom est requis", "error"); return; }
    const c = await apiClients.create(quickClient);
    setClientId(c.id); setQuickClientOpen(false);
    setQuickClient({ nom: "", tel: "", email: "", addr: "" });
    showToast("Client ajouté"); refetchClients();
  }

  function handleValiderVente() {
    if (cart.length === 0) { showToast("Le panier est vide", "error"); return; }
    if (venteType === "client" && !clientId) { showToast("Veuillez sélectionner un client", "error"); return; }
    if (modePaiement === "credit" && venteType !== "client") { showToast("Le crédit nécessite un client enregistré", "error"); return; }
    let montantPaye = total;
    if (modePaiement === "credit") {
      montantPaye = montantPayeInput === "" ? 0 : Number(montantPayeInput);
      if (montantPaye < 0 || montantPaye > total) { showToast("Montant payé invalide", "error"); return; }
    }
    const clientNom = venteType === "client" ? selectedClient?.nom || "" : "Client comptoir";
    runSave(async () => {
      const vente = await apiVentes.create({ type: venteType, clientId: venteType === "client" ? clientId : undefined, clientNom, items: cart, modePaiement, montantPaye, discountPercent, discountAmount });
      showToast("Vente enregistrée avec succès");
      setLastVente(vente); resetSale();
    });
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {/* Produits */}
      <div className="xl:col-span-2 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={search} onChange={(e) => handlePOSSearch(e.target.value)}
              placeholder="Rechercher un produit (nom, code-barre)… ou scanner avec le lecteur physique"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-9 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            {ajaxLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 animate-spin" />}
            {!ajaxLoading && search && (
              <button onClick={() => { setSearch(""); setAjaxProduits(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X className="h-4 w-4" /></button>
            )}
          </div>
          <button onClick={() => setScannerOpen(true)} title="Scanner caméra" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50 shrink-0">
            <ScanLine className="h-4 w-4" /><span className="hidden sm:inline">Caméra</span>
          </button>
        </div>

        {showTopHeader && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Produits les plus vendus — tapez pour rechercher tous les produits</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[70vh] overflow-y-auto pr-1">
            {ajaxLoading && <div className="col-span-full py-8 flex justify-center"><Loader2 className="h-6 w-6 text-indigo-400 animate-spin" /></div>}
            {!ajaxLoading && filteredProduits.length === 0 && search && <p className="col-span-full py-10 text-center text-sm text-slate-400">Aucun produit trouvé pour « {search} »</p>}
            {!ajaxLoading && filteredProduits.length === 0 && !search && <p className="col-span-full py-10 text-center text-sm text-slate-400">Aucun produit — commencez à vendre pour voir les plus populaires ici</p>}
            {filteredProduits.map((p) => {
              const oos = p.quantite <= 0;
              const isLow = !oos && p.quantite <= p.stockMin;
              return (
                <button key={p.id} disabled={oos} onClick={() => addToCart(p)}
                  className={`group flex flex-col rounded-2xl border p-3 text-left transition ${oos ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed" : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md"}`}>
                  <div className="flex h-16 items-center justify-center rounded-xl bg-slate-50 mb-2 text-2xl">📦</div>
                  <p className="text-sm font-semibold text-slate-800 line-clamp-2">{p.nom}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.codeBarre || "Pas de code"}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-indigo-600">{formatMAD(p.prix)}</span>
                    <span className={`flex items-center gap-0.5 text-[10px] font-semibold rounded-full px-1.5 py-0.5 ${oos ? "bg-red-100 text-red-600" : isLow ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                      {isLow && <AlertTriangle className="h-2.5 w-2.5" />}{p.quantite}
                    </span>
                  </div>
                 </button>
              );
            })}
          </div>
      </div>

      {/* Panier */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col sticky top-20">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800"><ShoppingCart className="h-4 w-4 text-indigo-600" />Panier ({cart.length})</h3>
          {cart.length > 0 && <button onClick={resetSale} className="text-xs text-red-500 hover:underline">Vider</button>}
        </div>
        <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
          {cart.length === 0 ? <p className="px-5 py-8 text-center text-sm text-slate-400">Panier vide</p> : cart.map((it) => (
            <div key={it.produitId} className="flex items-center gap-2 px-5 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{it.nom}</p>
                <p className="text-xs text-slate-400">{formatMAD(it.prix)} / unité</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(it.produitId, -1)} className="h-6 w-6 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"><Minus className="h-3 w-3" /></button>
                <span className="w-6 text-center text-sm font-medium">{it.quantite}</span>
                <button onClick={() => updateQty(it.produitId, 1)} className="h-6 w-6 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"><Plus className="h-3 w-3" /></button>
              </div>
              <button onClick={() => setCart((prev) => prev.filter((x) => x.produitId !== it.produitId))} className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 px-5 py-4 space-y-4">
          {/* Type vente */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500">Type de vente</p>
            <div className="grid grid-cols-2 gap-2">
              {(["comptoir", "client"] as TypeVente[]).map((t) => (
                <button key={t} onClick={() => setVenteType(t)} className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold ${venteType === t ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>
                  {t === "comptoir" ? <><Store className="h-3.5 w-3.5" />Comptoir</> : <><User className="h-3.5 w-3.5" />Client</>}
                </button>
              ))}
            </div>
          </div>
          {venteType === "client" && (
            <div className="flex gap-2">
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="flex-1 rounded-lg border border-slate-200 py-2 px-2.5 text-sm outline-none focus:border-indigo-400">
                <option value="">Sélectionner un client...</option>
                {typedClients.map((c) => <option key={c.id} value={c.id}>{c.nom} {c.tel ? `(${c.tel})` : ""}</option>)}
              </select>
              <button onClick={() => setQuickClientOpen(true)} className="rounded-lg border border-slate-200 px-3 text-indigo-600 hover:bg-indigo-50"><UserPlus className="h-4 w-4" /></button>
            </div>
          )}
          {/* Remise */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500">Remise</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="relative block">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input type="number" min={0} max={100} step="0.01" value={discountPercentInput} onChange={(e) => setDiscountPercentInput(e.target.value)} placeholder="%" className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-2 text-sm outline-none focus:border-indigo-400" />
              </label>
              <label className="relative block">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input type="number" min={0} step="0.01" value={discountAmountInput} onChange={(e) => setDiscountAmountInput(e.target.value)} placeholder="MAD" className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-2 text-sm outline-none focus:border-indigo-400" />
              </label>
            </div>
          </div>
          {/* Mode paiement */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500">Mode de paiement</p>
            <div className="grid grid-cols-3 gap-2">
              {([["especes", Banknote, "Espèces"], ["carte", CreditCard, "Carte"], ["credit", Wallet, "Crédit"]] as [ModePaiement, React.ElementType, string][]).map(([k, Icon, label]) => (
                <button key={k} onClick={() => setModePaiement(k)} className={`flex flex-col items-center justify-center gap-1 rounded-lg border py-2 text-[11px] font-semibold ${modePaiement === k ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </div>
          </div>
          {modePaiement === "credit" && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500">Avance (MAD)</p>
              <input type="number" min={0} max={total} step="0.01" value={montantPayeInput} onChange={(e) => setMontantPayeInput(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-indigo-400" />
              <p className="mt-1 text-xs text-slate-400">Reste: {formatMAD(total - (montantPayeInput === "" ? 0 : Number(montantPayeInput) || 0))}</p>
            </div>
          )}
          {/* Total */}
          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            {(discountPercent > 0 || discountAmount > 0) && (
              <>
                <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Sous-total</span><span>{formatMAD(sousTotal)}</span></div>
                {discountPercent > 0 && <div className="flex items-center justify-between text-sm text-emerald-600"><span>Remise ({discountPercent}%)</span><span>-{formatMAD(montantRemise)}</span></div>}
                {discountAmount > 0 && <div className="flex items-center justify-between text-sm text-emerald-600"><span>Remise (MAD)</span><span>-{formatMAD(discountAmount)}</span></div>}
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total</span>
              <span className="text-2xl font-bold text-slate-900">{formatMAD(total)}</span>
            </div>
          </div>
          <SaveButton saving={saving} label="Valider la vente" savingLabel="Enregistrement…" type="button" onClick={handleValiderVente} disabled={cart.length === 0} icon={Receipt} fullWidth />
        </div>
      </div>

      <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onDetected={async (code) => {
        setScannerOpen(false);
        try {
          const res = await apiProduits.list(1, 1, code.trim(), "");
          if (res.data[0]) { addToCart(res.data[0]); showToast(`"${res.data[0].nom}" ajouté`); }
          else showToast(`Code ${code} introuvable`, "error");
        } catch { showToast(`Code ${code} introuvable`, "error"); }
      }} />

      <Modal open={quickClientOpen} onClose={() => setQuickClientOpen(false)} title="Nouveau client rapide" size="sm">
        <form onSubmit={handleCreateQuickClient} className="space-y-3">
          {(["nom *", "tel", "email", "addr"] as const).map((f) => {
            const key = f.replace(" *", "") as keyof typeof quickClient;
            return (
              <input key={f} placeholder={f} value={quickClient[key]} onChange={(e) => setQuickClient({ ...quickClient, [key]: e.target.value })}
                className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-indigo-400" />
            );
          })}
          <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Ajouter le client</button>
        </form>
      </Modal>

      <Modal open={!!lastVente} onClose={() => setLastVente(null)} title="Vente enregistrée" size="md">
        {lastVente && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
              <InvoicePrint ref={printRef} vente={lastVente} settings={settings} />
            </div>
            <div className="flex gap-2 no-print">
              <button onClick={() => setLastVente(null)} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <X className="h-4 w-4" /> Fermer
              </button>
              <button onClick={() => window.print()} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                <Printer className="h-4 w-4" /> Imprimer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
