import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Truck, Phone, Mail, MapPin, Hash, Loader2 } from "lucide-react";
import Pagination, { type PageSize } from "../components/Pagination";
import type { Fournisseur } from "../types";
import { apiFournisseurs } from "../services/api";
import { useApi } from "../hooks/useApi";
import { useSaving } from "../hooks/useSaving";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import SaveButton from "../components/SaveButton";
import { LoadingBlock } from "../components/Spinner";
import { useToast } from "../components/ToastProvider";

const emptyForm = { nom: "", tel: "", email: "", ice: "", addr: "" };

function Field({ label, icon: Icon, value, onChange, type = "text", required = false }:
  { label: string; icon: React.ElementType; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
      </div>
    </label>
  );
}

export default function Fournisseurs() {
  const { showToast } = useToast();
  const { data: allFournisseurs, loading, error, refetch } = useApi(apiFournisseurs.list, [], [] as Fournisseur[]);
  const [search, setSearch] = useState("");
  const [ajaxResults, setAjaxResults] = useState<Fournisseur[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Fournisseur | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toDelete, setToDelete] = useState<Fournisseur | null>(null);
  const [saving, runSave] = useSaving();
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!val.trim()) { setAjaxResults(null); setSearching(false); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await apiFournisseurs.search(val);
        setAjaxResults(res);
      } catch { /* ignore */ } finally {
        setSearching(false);
      }
    }, 300);
    setDebounceTimer(t);
  }

  const filteredFournisseurs = useMemo(() => {
    if (search.trim() && ajaxResults !== null) return ajaxResults;
    if (!search.trim()) return allFournisseurs;
    const q = search.toLowerCase();
    return allFournisseurs.filter((f) =>
      f.nom.toLowerCase().includes(q) || (f.tel ?? "").includes(q) ||
      (f.email ?? "").toLowerCase().includes(q) || (f.ice ?? "").includes(q)
    );
  }, [search, ajaxResults, allFournisseurs]);

  const totalFournisseurs = filteredFournisseurs.length;
  const totalPagesFourn = Math.max(1, Math.ceil(totalFournisseurs / pageSize));
  const fournisseurs = useMemo(
    () => filteredFournisseurs.slice((page - 1) * pageSize, page * pageSize),
    [filteredFournisseurs, page, pageSize]
  );

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(f: Fournisseur) {
    setEditing(f);
    setForm({ nom: f.nom, tel: f.tel ?? "", email: f.email ?? "", ice: f.ice ?? "", addr: f.addr ?? "" });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim()) { showToast("Le nom est requis", "error"); return; }
    runSave(async () => {
      if (editing) { await apiFournisseurs.update(editing.id, form); showToast("Fournisseur mis à jour"); }
      else { await apiFournisseurs.create(form); showToast("Fournisseur ajouté"); }
      setModalOpen(false);
      setSearch(""); setAjaxResults(null);
      refetch();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher (nom, tél, email, ICE)…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 animate-spin" />}
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 shrink-0">
          <Plus className="h-4 w-4" /> Nouveau fournisseur
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">Erreur : {error}</p>}
      {loading && <LoadingBlock label="Chargement des fournisseurs…" />}

      {!loading && fournisseurs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Truck className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">{search ? `Aucun résultat pour « ${search} »` : "Aucun fournisseur enregistré"}</p>
        </div>
      )}

      {!loading && fournisseurs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fournisseurs.map((f) => (
            <div key={f.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg">{f.nom.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="font-semibold text-slate-800">{f.nom}</p>
                    <p className="text-xs text-slate-400">ICE: {f.ice || "—"}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(f)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setToDelete(f)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" />{f.tel || "—"}</p>
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" />{f.email || "—"}</p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400" />{f.addr || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && totalFournisseurs > 0 && (
        <Pagination
          page={page}
          totalPages={totalPagesFourn}
          total={totalFournisseurs}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          label="fournisseur(s)"
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier le fournisseur" : "Nouveau fournisseur"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nom" icon={Truck} value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Téléphone" icon={Phone} value={form.tel} onChange={(v) => setForm({ ...form, tel: v })} />
            <Field label="ICE" icon={Hash} value={form.ice} onChange={(v) => setForm({ ...form, ice: v })} />
          </div>
          <Field label="Email" icon={Mail} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Adresse" icon={MapPin} value={form.addr} onChange={(v) => setForm({ ...form, addr: v })} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Annuler</button>
            <SaveButton saving={saving} label={editing ? "Enregistrer" : "Ajouter"} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!toDelete} message={`Supprimer le fournisseur « ${toDelete?.nom} » ?`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) { await apiFournisseurs.delete(toDelete.id); showToast("Fournisseur supprimé", "info"); setSearch(""); setAjaxResults(null); refetch(); }
          setToDelete(null);
        }} />
    </div>
  );
}
