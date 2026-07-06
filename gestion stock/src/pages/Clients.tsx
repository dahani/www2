import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Users, Phone, Mail, MapPin, Wallet, Loader2 } from "lucide-react";
import Pagination, { type PageSize } from "../components/Pagination";
import type { Client, Credit } from "../types";
import { apiClients, apiCredits } from "../services/api";
import { useApi } from "../hooks/useApi";
import { useSaving } from "../hooks/useSaving";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import SaveButton from "../components/SaveButton";
import { LoadingBlock } from "../components/Spinner";
import { useToast } from "../components/ToastProvider";
import { formatMAD } from "../utils/format";

const emptyForm = { nom: "", tel: "", email: "", addr: "" };

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

export default function Clients() {
  const { showToast } = useToast();

  // Load ALL clients on mount, filter client-side, AJAX search for >0 chars
  const { data: allClients, loading, error, refetch } = useApi(apiClients.list, [], [] as Client[]);
  const { data: creditsData } = useApi(apiCredits.list, [], [] as Credit[]);

  const [search, setSearch] = useState("");
  const [ajaxResults, setAjaxResults] = useState<Client[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toDelete, setToDelete] = useState<Client | null>(null);
  const [saving, runSave] = useSaving();
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const creditByClient = useMemo(() => {
    const map: Record<string, number> = {};
    creditsData.filter((c) => c.statut === "ouvert").forEach((c) => {
      map[c.clientId] = (map[c.clientId] || 0) + (c.montantTotal - c.montantPaye);
    });
    return map;
  }, [creditsData]);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!val.trim()) { setAjaxResults(null); setSearching(false); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await apiClients.search(val);
        setAjaxResults(res);
      } catch { /* ignore */ } finally {
        setSearching(false);
      }
    }, 300);
    setDebounceTimer(t);
  }

  // Use ajax results if available, otherwise local filter + client-side pagination
  const filteredClients = useMemo(() => {
    if (search.trim() && ajaxResults !== null) return ajaxResults;
    if (!search.trim()) return allClients;
    const q = search.toLowerCase();
    return allClients.filter((c) =>
      c.nom.toLowerCase().includes(q) || (c.tel ?? "").includes(q) || (c.email ?? "").toLowerCase().includes(q)
    );
  }, [search, ajaxResults, allClients]);

  const totalClients = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(totalClients / pageSize));
  const clients = useMemo(
    () => filteredClients.slice((page - 1) * pageSize, page * pageSize),
    [filteredClients, page, pageSize]
  );

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(c: Client) {
    setEditing(c);
    setForm({ nom: c.nom, tel: c.tel ?? "", email: c.email ?? "", addr: c.addr ?? "" });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim()) { showToast("Le nom est requis", "error"); return; }
    runSave(async () => {
      if (editing) { await apiClients.update(editing.id, form); showToast("Client mis à jour"); }
      else { await apiClients.create(form); showToast("Client ajouté"); }
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
            placeholder="Rechercher un client (nom, tél, email)…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 animate-spin" />}
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 shrink-0">
          <Plus className="h-4 w-4" /> Nouveau client
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">Erreur : {error}</p>}
      {loading && <LoadingBlock label="Chargement des clients…" />}

      {!loading && clients.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Users className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">{search ? `Aucun résultat pour « ${search} »` : "Aucun client enregistré"}</p>
        </div>
      )}

      {!loading && clients.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Téléphone</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Adresse</th>
                <th className="px-5 py-3">Crédit</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">{c.nom.charAt(0).toUpperCase()}</div>
                      {c.nom}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500"><span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" />{c.tel || "—"}</span></td>
                  <td className="px-5 py-3 text-slate-500"><span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" />{c.email || "—"}</span></td>
                  <td className="px-5 py-3 text-slate-500"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{c.addr || "—"}</span></td>
                  <td className="px-5 py-3">
                    {creditByClient[c.id] > 0
                      ? <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 w-fit"><Wallet className="h-3.5 w-3.5" />{formatMAD(creditByClient[c.id])}</span>
                      : <span className="text-xs text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setToDelete(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination (shown when data is loaded, always visible) */}
      {!loading && totalClients > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={totalClients}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          label="client(s)"
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier le client" : "Nouveau client"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nom" icon={Users} value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Téléphone" icon={Phone} value={form.tel} onChange={(v) => setForm({ ...form, tel: v })} />
            <Field label="Email" icon={Mail} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          </div>
          <Field label="Adresse" icon={MapPin} value={form.addr} onChange={(v) => setForm({ ...form, addr: v })} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Annuler</button>
            <SaveButton saving={saving} label={editing ? "Enregistrer" : "Ajouter"} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!toDelete} message={`Supprimer le client « ${toDelete?.nom} » ?`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) { await apiClients.delete(toDelete.id); showToast("Client supprimé", "info"); setSearch(""); setAjaxResults(null); refetch(); }
          setToDelete(null);
        }} />
    </div>
  );
}
