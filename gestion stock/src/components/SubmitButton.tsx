import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: string;
}

/**
 * Standard submit button used across all forms (create/update actions).
 * Shows a spinner and disables interaction while `loading` is true.
 */
export default function SubmitButton({
  loading = false,
  loadingLabel = "Enregistrement…",
  children,
  className = "",
  disabled,
  ...rest
}: SubmitButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? loadingLabel : children}
    </button>
  );
}
