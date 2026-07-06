import { useEffect, useState } from "react";
import { Building2, Phone, MapPin, Mail, Hash, Save, Store, Server, CircleDot, Zap, Loader2 } from "lucide-react";
import { useToast } from "../components/ToastProvider";
import ThemeSwitcher from "../components/ThemeSwitcher";
import SaveButton from "../components/SaveButton";
import { useSaving } from "../hooks/useSaving";
import { useApi } from "../hooks/useApi";
import { apiSettings, isApiEnabled } from "../services/api";
import type { AppSettings } from "../types";
import { LoadingBlock } from "../components/Spinner";

const defaultSettings: AppSettings = { nom: "StockPro", tel: "", addr: "", email: "", ice: "" };

function Field({ label, icon: Icon, value, onChange, type = "text", required = false }:
  { label: string; icon: React.ElementType; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
      </div>
    </label>
  );
}

export default function Settings() {
  const { data: remoteSettings, loading } = useApi(apiSettings.get, [], defaultSettings);
  const { showToast } = useToast();
  const [form, setForm] = useState<AppSettings>(defaultSettings);
  const [saving, runSave] = useSaving();
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Only update form once we get real data from the server (not the default placeholder)
    if (remoteSettings && remoteSettings !== defaultSettings) setForm(remoteSettings);
  }, [remoteSettings]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim()) { showToast("Le nom est requis", "error"); return; }
    runSave(async () => {
      await apiSettings.update(form);
      showToast("Paramètres enregistrés");
    });
  }

  async function handleTestConnection() {
    if (testing) return;
    setTesting(true);
    try {
      if (isApiEnabled) {
        await apiSettings.get();
        showToast("Connexion à l'API réussie ✅");
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        showToast("Mode local — aucune API configurée", "info");
      }
    } catch (e) {
      showToast(`Échec : ${e instanceof Error ? e.message : "erreur"}`, "error");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* API Status */}
      <div className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border px-5 py-4 text-sm ${isApiEnabled ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isApiEnabled ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
          <Server className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="font-semibold flex items-center gap-2">
            Backend Symfony 8
            <CircleDot className={`h-3 w-3 ${isApiEnabled ? "text-emerald-500" : "text-amber-400"}`} />
          </p>
          <p className="text-xs opacity-80">
            {isApiEnabled
              ? `Connecté — ${import.meta.env.VITE_API_URL}`
              : "Non configuré. Ajoutez VITE_API_URL dans .env et relancez le serveur."}
          </p>
        </div>
        <button onClick={handleTestConnection} disabled={testing}
          className="flex items-center gap-2 rounded-lg border border-white/60 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 shrink-0">
          {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
          {testing ? "Test…" : "Tester"}
        </button>
      </div>

      <ThemeSwitcher />

      {/* Company Info */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Informations de l'entreprise</h3>
            <p className="text-xs text-slate-400">Apparaissent sur les factures et reçus imprimés.</p>
          </div>
        </div>

        {loading ? <LoadingBlock label="Chargement des paramètres…" /> : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
            <Field label="Nom de l'entreprise" icon={Building2} value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Téléphone" icon={Phone} value={form.tel ?? ""} onChange={(v) => setForm({ ...form, tel: v })} />
              <Field label="Email" icon={Mail} type="email" value={form.email ?? ""} onChange={(v) => setForm({ ...form, email: v })} />
            </div>
            <Field label="Adresse" icon={MapPin} value={form.addr ?? ""} onChange={(v) => setForm({ ...form, addr: v })} />
            <Field label="ICE" icon={Hash} value={form.ice ?? ""} onChange={(v) => setForm({ ...form, ice: v })} />
            <div className="flex justify-end pt-2">
              <SaveButton saving={saving} label="Enregistrer les modifications" savingLabel="Enregistrement…" icon={Save} />
            </div>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-3 font-semibold text-slate-800">Aperçu reçu</h3>
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 font-mono text-xs text-slate-600 text-center space-y-1 max-w-xs mx-auto">
          <p className="text-sm font-bold uppercase tracking-wide">{form.nom || "Nom entreprise"}</p>
          <p>{form.addr || "Adresse"}</p>
          <p>Tél: {form.tel || "—"} {form.email ? `— ${form.email}` : ""}</p>
          <p>ICE: {form.ice || "—"}</p>
        </div>
      </div>
    </div>
  );
}
