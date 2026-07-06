import { Loader2, ServerCrash, RefreshCw, Boxes } from "lucide-react";
import { isApiEnabled } from "../services/api";

interface ApiStatusScreenProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/**
 * Full-page blocking screen shown while the initial data load from the
 * Symfony API is in progress, or when it fails / the API is not configured.
 * StockPro has no localStorage fallback, so the app cannot be used until
 * the API responds successfully.
 */
export default function ApiStatusScreen({ loading, error, onRetry }: ApiStatusScreenProps) {
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
          <Boxes className="h-7 w-7" />
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="text-sm font-medium">Chargement des données depuis l'API…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-50 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <ServerCrash className="h-8 w-8" />
      </div>
      <div className="max-w-md space-y-2">
        <h1 className="text-lg font-bold text-slate-900">
          {isApiEnabled ? "Connexion à l'API impossible" : "Backend non configuré"}
        </h1>
        <p className="text-sm text-slate-500">
          {isApiEnabled
            ? error ?? "Une erreur inconnue est survenue lors du chargement des données."
            : "StockPro n'utilise aucun stockage local : toutes les données proviennent de l'API Symfony. Renseignez VITE_API_URL dans le fichier .env à la racine du projet, puis relancez l'application."}
        </p>
        {!isApiEnabled && (
          <pre className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-left text-xs text-emerald-300 overflow-x-auto">
            VITE_API_URL=http://127.0.0.1:8000/api
          </pre>
        )}
        <p className="text-xs text-slate-400">Voir backend/README.md pour démarrer l'API Symfony.</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700"
      >
        <RefreshCw className="h-4 w-4" /> Réessayer
      </button>
    </div>
  );
}
