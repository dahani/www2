import { useEffect, useRef, useState } from "react";
import { Search, User, Loader2, X, UserPlus } from "lucide-react";
import { apiClients } from "../services/api";
import type { Client } from "../types";

interface ClientSearchSelectProps {
  value: Client | null;
  onChange: (client: Client | null) => void;
  onCreateNew: () => void;
}

const DEBOUNCE_MS = 300;

/**
 * Searchable client picker that queries the database via AJAX as the user
 * types (debounced), instead of relying on a fully preloaded client list.
 */
export default function ClientSearchSelect({ value, onChange, onCreateNew }: ClientSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await apiClients.list({ q: query, limit: 15 });
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open]);

  return (
    <div className="relative" ref={containerRef}>
      {value ? (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 py-2 px-2.5 text-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold shrink-0">
            {value.nom.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-slate-700">{value.nom}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
            className="text-slate-300 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              placeholder="Rechercher un client..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-8 text-sm outline-none focus:border-indigo-400"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-indigo-400" />}
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            title="Nouveau client"
            className="rounded-lg border border-slate-200 px-3 text-indigo-600 hover:bg-indigo-50 shrink-0"
          >
            <UserPlus className="h-4 w-4" />
          </button>
        </div>
      )}

      {open && !value && (
        <div className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-xs text-slate-400 text-center">
              {loading ? "Recherche..." : "Aucun client trouvé"}
            </p>
          ) : (
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="flex-1 truncate">{c.nom}</span>
                {c.tel && <span className="text-xs text-slate-400 shrink-0">{c.tel}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
