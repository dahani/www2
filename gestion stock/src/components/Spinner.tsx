import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

/** Small inline spinner — useful next to buttons or in empty states. */
export default function Spinner({ size = 16, className = "", label }: SpinnerProps) {
  return (
    <span className={`inline-flex items-center gap-2 text-slate-500 ${className}`}>
      <Loader2 className="animate-spin" style={{ width: size, height: size }} />
      {label && <span className="text-xs">{label}</span>}
    </span>
  );
}

/** Full-panel loading placeholder for lists/tables while data is fetched. */
export function LoadingBlock({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
