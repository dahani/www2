import { Loader2, Save } from "lucide-react";

interface SaveButtonProps {
  saving: boolean;
  label?: string;
  savingLabel?: string;
  type?: "submit" | "button";
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "success" | "danger";
  fullWidth?: boolean;
  icon?: React.ElementType;
}

const variants = {
  primary: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
  success: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
  danger:  "bg-red-600   hover:bg-red-700   shadow-red-200",
};

export default function SaveButton({
  saving,
  label = "Enregistrer",
  savingLabel = "Enregistrement…",
  type = "submit",
  onClick,
  disabled = false,
  variant = "primary",
  fullWidth = false,
  icon: Icon = Save,
}: SaveButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || saving}
      className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {saving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {savingLabel}
        </>
      ) : (
        <>
          <Icon className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}
