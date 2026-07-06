import { useState, useEffect, useCallback, useRef } from "react";
import { useLoading } from "../store/useLoading";

/**
 * AJAX debounced search hook.
 * - Fires `searcher(query)` only when the query has settled (after `delay` ms).
 * - Returns the latest results, a loading flag, and an error string.
 * - Cancels stale in-flight requests automatically.
 */
export function useDebounceSearch<T>(
  searcher: (q: string) => Promise<T[]>,
  delay = 320
) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { start, stop } = useLoading.getState();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setSearching(true);
      setError(null);
      start(`SEARCH ${query}`);
      try {
        const data = await searcher(query);
        setResults(data);
      } catch (e: unknown) {
        if ((e as Error).name !== "AbortError") {
          setError((e as Error).message ?? "Erreur");
        }
      } finally {
        setSearching(false);
        stop();
      }
    }, delay);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, delay]);

  const clear = useCallback(() => { setQuery(""); setResults([]); }, []);

  return { query, setQuery, results, searching, error, clear };
}
