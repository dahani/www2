import { Loader2 } from "lucide-react";
import { useLoading } from "../store/useLoading";

/** Compact pill shown in the app header while API requests are in flight. */
export default function HeaderLoadingBadge() {
  const pending = useLoading((s) => s.pending);
  const label = useLoading((s) => s.lastLabel);

  if (pending === 0) return null;

  return (
    <div className="hidden sm:flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100 animate-[fadeIn_0.15s_ease-out] no-print">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      <span>
        Chargement
        {pending > 1 ? ` (${pending})` : ""}
        {label ? ` · ${label}` : "…"}
      </span>
    </div>
  );
}
