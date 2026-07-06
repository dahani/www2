import { useEffect, useRef, useState } from "react";
import {
  Plus, Search, Pencil, Trash2, Package, Barcode, Palette,
  Weight, AlertTriangle, DollarSign, Tag, ScanLine, Loader2,
  X, Upload, Download, FileSpreadsheet,
} from "lucide-react";
import Pagination, { type PageSize } from "../components/Pagination";
import type { Produit } from "../types";
import { apiProduits } from "../services/api";
import { useApi } from "../hooks/useApi";
import { useSaving } from "../hooks/useSaving";
import { useHardwareScanner } from "../hooks/useHardwareScanner";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import SaveButton from "../components/SaveButton";
import { LoadingBlock } from "../components/Spinner";
import { useToast } from "../components/ToastProvider";
import { formatMAD } from "../utils/format";
import { downloadTemplate, exportProduits, parseImportFile } from "../utils/excelProduits";

const emptyForm = {
  nom: "", codeBarre: "", quantite: "0", prix: "0",
  prixAchat: "0", couleur: "", poids: "0", stockMin: "5", categorie: "",
};

function Field({ label, icon: Icon, value, onChange, type = "text", required = false }:
  { label: string; icon: React.ElementType; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type={type} step={type === "number" ? "0.01" : undefined} value={value} required={required}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
      </div>
    </label>
  );
}

export default function Produits() {
  const { showToast } = useToast();

  // ── Search & pagination ──────────────────────────────────
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStock, setFilterStock] = useState<"" | "bas" | "rupture">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tableTopRef = useRef<HTMLDivElement>(null);

  function handleSearchChange(val: string) {
    setSearch(val);
    setSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
      setSearching(false);
    }, 320);
  }

  function clearSearch() { setSearch(""); setDebouncedSearch(""); setPage(1); setSearching(false); }

  const { data, loading, error, refetch } = useApi(
    () => apiProduits.list(page, pageSize, debouncedSearch, filterStock),
    [page, pageSize, debouncedSearch, filterStock],
    { data: [] as Produit[], total: 0 }
  );
  const produits: Produit[] = data.data;
  const total: number = data.total;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    tableTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  function handleFilterChange(f: "" | "bas" | "rupture") { setFilterStock(f); setPage(1); }

  // ── Modal / CRUD state (declared before scanner hook so it can read them) ─
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Produit | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [toDelete, setToDelete] = useState<Produit | null>(null);
  const [saving, runSave] = useSaving();

  // ── Import / Export ───────────────────────────────────────
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // ── Hardware scanner (physical barcode reader) ────────────
  // Disabled when any modal or dialog is open, AND always silent when an
  // <input>/<textarea>/<select> has focus (handled inside the hook itself).
  useHardwareScanner(async (code) => {
    handleSearchChange(code);
    showToast(`Code-barre scanné : ${code}`, "info");
  }, !modalOpen && !scannerOpen && !importModalOpen && !toDelete);

  async function handleExport() {
    try {
      // Export all (no pagination) — fetch with a big limit
      const res = await apiProduits.list(1, 10000, "", "");
      exportProduits(res.data);
      showToast(`${res.data.length} produits exportés`);
    } catch (e) {
      showToast((e as Error).message, "error");
    }
  }

  async function handleImport() {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const rows = await parseImportFile(importFile);
      let imported = 0;
      const errors: string[] = [];
      for (const row of rows) {
        try {
          await apiProduits.create(row);
          imported++;
        } catch (e) {
          errors.push(`${row.nom}: ${(e as Error).message}`);
        }
      }
      setImportResult({ imported, errors });
      if (imported > 0) { refetch(); showToast(`${imported} produit(s) importé(s)`); }
    } catch (e) {
      showToast((e as Error).message, "error");
    } finally {
      setImporting(false);
    }
  }

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(p: Produit) {
    setEditing(p);
    setForm({ nom: p.nom, codeBarre: p.codeBarre ?? "", quantite: String(p.quantite), prix: String(p.prix), prixAchat: String(p.prixAchat), couleur: p.couleur ?? "", poids: String(p.poids), stockMin: String(p.stockMin), categorie: p.categorie ?? "" });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim()) { showToast("Le nom est requis", "error"); return; }
    const payload = { nom: form.nom, codeBarre: form.codeBarre, quantite: Number(form.quantite) || 0, prix: Number(form.prix) || 0, prixAchat: Number(form.prixAchat) || 0, couleur: form.couleur, poids: Number(form.poids) || 0, stockMin: Number(form.stockMin) || 0, categorie: form.categorie };
    runSave(async () => {
      if (editing) { await apiProduits.update(editing.id, payload); showToast("Produit mis à jour"); }
      else { await apiProduits.create(payload); showToast("Produit ajouté"); }
      setModalOpen(false); refetch();
    });
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={search} onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Rechercher (nom, code-barre, catégorie)…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 animate-spin" />}
            {!searching && search && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X className="h-4 w-4" /></button>
            )}
          </div>
          <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1 w-fit shrink-0">
            {([["", "Tous"], ["bas", "Stock bas"], ["rupture", "Rupture"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => handleFilterChange(val)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filterStock === val ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap shrink-0">
          <button onClick={() => downloadTemplate()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm"
            title="Télécharger le modèle Excel vide">
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Modèle
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
            <Download className="h-4 w-4 text-indigo-500" /> Exporter
          </button>
          <button onClick={() => { setImportFile(null); setImportResult(null); setImportModalOpen(true); }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
            <Upload className="h-4 w-4 text-violet-500" /> Importer
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> Nouveau produit
          </button>
        </div>
      </div>

      <div ref={tableTopRef} />

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">Erreur : {error}</p>}

      {loading ? (
        <LoadingBlock label="Chargement des produits…" />
      ) : produits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">{search || filterStock ? `Aucun produit pour « ${search || filterStock} »` : "Aucun produit"}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3">Produit</th>
                  <th className="px-5 py-3">Code-barre</th>
                  <th className="px-5 py-3">Couleur</th>
                  <th className="px-5 py-3">Poids</th>
                  <th className="px-5 py-3">Prix</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {produits.map((p) => {
                  const isLow = p.quantite > 0 && p.quantite <= p.stockMin;
                  const isOut = p.quantite === 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3"><p className="font-medium text-slate-800">{p.nom}</p><p className="text-xs text-slate-400">{p.categorie || "—"}</p></td>
                      <td className="px-5 py-3 text-slate-500 font-mono text-xs">{p.codeBarre || "—"}</td>
                      <td className="px-5 py-3 text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-full border border-slate-300" style={{ backgroundColor: p.couleur || "#e2e8f0" }} />
                          {p.couleur || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{p.poids} kg</td>
                      <td className="px-5 py-3"><p className="font-semibold text-slate-800">{formatMAD(p.prix)}</p><p className="text-xs text-slate-400">Achat: {formatMAD(p.prixAchat)}</p></td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${isOut ? "bg-red-50 text-red-600" : isLow ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                          {(isLow || isOut) && <AlertTriangle className="h-3 w-3" />}
                          {isOut ? "Rupture" : `${p.quantite} u.`}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setToDelete(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
            label="produit(s)"
          />
        </>
      )}

      {/* Add / Edit */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier le produit" : "Nouveau produit"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nom du produit" icon={Package} value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Code-barre</span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input value={form.codeBarre} onChange={(e) => setForm({ ...form, codeBarre: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                </div>
                <button type="button" onClick={() => setScannerOpen(true)} className="rounded-lg border border-slate-200 px-3 text-slate-500 hover:bg-slate-50" title="Scanner caméra"><ScanLine className="h-4 w-4" /></button>
                <button type="button" onClick={() => setForm((f) => ({ ...f, codeBarre: Math.floor(1000000000000 + Math.random() * 8999999999999).toString() }))}
                  className="rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-500 hover:bg-slate-50">Auto</button>
              </div>
            </label>
            <Field label="Catégorie" icon={Tag} value={form.categorie} onChange={(v) => setForm({ ...form, categorie: v })} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Quantité" icon={Package} type="number" value={form.quantite} onChange={(v) => setForm({ ...form, quantite: v })} />
            <Field label="Stock min" icon={AlertTriangle} type="number" value={form.stockMin} onChange={(v) => setForm({ ...form, stockMin: v })} />
            <Field label="Prix vente (MAD)" icon={DollarSign} type="number" value={form.prix} onChange={(v) => setForm({ ...form, prix: v })} />
            <Field label="Prix achat (MAD)" icon={DollarSign} type="number" value={form.prixAchat} onChange={(v) => setForm({ ...form, prixAchat: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Couleur" icon={Palette} value={form.couleur} onChange={(v) => setForm({ ...form, couleur: v })} />
            <Field label="Poids (kg)" icon={Weight} type="number" value={form.poids} onChange={(v) => setForm({ ...form, poids: v })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Annuler</button>
            <SaveButton saving={saving} label={editing ? "Enregistrer" : "Ajouter"} />
          </div>
        </form>
      </Modal>

      {/* Camera barcode scanner (fallback) */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Scanner caméra</h3>
              <button onClick={() => setScannerOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-8 text-center">
              <ScanLine className="mx-auto h-12 w-12 text-indigo-400 mb-3" />
              <p className="text-sm text-slate-500">Le scanner caméra n'est pas disponible dans cette vue.</p>
              <p className="text-xs text-slate-400 mt-1">Utilisez le lecteur code-barre physique directement — la saisie est automatiquement détectée.</p>
            </div>
            <button onClick={() => setScannerOpen(false)} className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Fermer</button>
          </div>
        </div>
      )}

      {/* Import modal */}
      <Modal open={importModalOpen} onClose={() => setImportModalOpen(false)} title="Importer des produits" size="md">
        <div className="space-y-4">
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-sm text-indigo-800 space-y-1">
            <p className="font-semibold">Format attendu</p>
            <p className="text-xs text-indigo-600">Fichier Excel (.xlsx) ou CSV avec les colonnes du modèle. Les lignes sans "Nom" seront ignorées.</p>
            <button onClick={() => downloadTemplate()} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:underline mt-1">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Télécharger le modèle vide
            </button>
          </div>

          <label className="block cursor-pointer">
            <span className="mb-1 block text-xs font-medium text-slate-500">Fichier à importer</span>
            <div className={`flex items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition ${importFile ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:border-indigo-300"}`}>
              <Upload className="h-6 w-6 text-slate-400" />
              <div className="text-sm text-slate-500">
                {importFile ? <span className="font-semibold text-indigo-700">{importFile.name}</span> : <span>Glisser ou <span className="text-indigo-600 font-semibold">cliquer pour choisir</span></span>}
              </div>
            </div>
            <input ref={importInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={(e) => { setImportFile(e.target.files?.[0] ?? null); setImportResult(null); }} />
          </label>

          {importResult && (
            <div className={`rounded-xl p-3 text-sm ${importResult.errors.length > 0 ? "bg-amber-50 border border-amber-200" : "bg-emerald-50 border border-emerald-200"}`}>
              <p className="font-semibold text-slate-800">{importResult.imported} produit(s) importé(s)</p>
              {importResult.errors.map((err, i) => <p key={i} className="text-xs text-red-600 mt-0.5">{err}</p>)}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setImportModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Fermer</button>
            <button
              disabled={!importFile || importing}
              onClick={handleImport}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {importing ? "Importation…" : "Lancer l'import"}
            </button>
          </div>
        </div>
      </Modal>

      {/* File input trigger */}
      {importModalOpen && (
        <div className="hidden">
          <label htmlFor="import-file-trigger" onClick={() => importInputRef.current?.click()} />
        </div>
      )}

      <ConfirmDialog open={!!toDelete} message={`Supprimer le produit « ${toDelete?.nom} » ?`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) { await apiProduits.delete(toDelete.id); showToast("Produit supprimé", "info"); refetch(); }
          setToDelete(null);
        }} />
    </div>
  );
}
