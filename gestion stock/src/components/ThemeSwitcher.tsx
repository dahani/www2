import { Check, Palette } from "lucide-react";
import { useStore, type ThemeName } from "../store/useStore";
import { themes } from "../theme/themes";

export default function ThemeSwitcher() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Palette className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Thème de couleur</h3>
          <p className="text-xs text-slate-400">
            Choisissez la couleur d'accent principale de l'application.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-6 py-6">
        {(Object.keys(themes) as ThemeName[]).map((key) => {
          const t = themes[key];
          const active = theme === key;
          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`group flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition ${
                active
                  ? "border-slate-800 bg-slate-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-full shadow-md"
                style={{ backgroundColor: t.preview }}
              >
                {active && <Check className="h-5 w-5 text-white" strokeWidth={3} />}
              </div>
              <span className="text-xs font-semibold text-slate-700">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
