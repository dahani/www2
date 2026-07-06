import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export type PageSize = typeof PAGE_SIZE_OPTIONS[number];

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: PageSize;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: PageSize) => void;
  /** Label used in the count string, e.g. "produit(s)", "vente(s)" */
  label?: string;
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  label = "élément(s)",
}: PaginationProps) {
  const from = Math.min((page - 1) * pageSize + 1, total);
  const to   = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-slate-500 select-none">
      {/* Left: count + page size selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs">
          {total === 0 ? `0 ${label}` : `${from}–${to} sur ${total} ${label}`}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 hidden sm:inline">Lignes :</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value) as PageSize);
              onPageChange(1);
            }}
            className="rounded-lg border border-slate-200 bg-white py-1 pl-2 pr-6 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: navigation buttons */}
      <div className="flex items-center gap-1">
        <NavBtn
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          title="Première page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </NavBtn>
        <NavBtn
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          title="Page précédente"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Précédent</span>
        </NavBtn>

        {/* Page pills */}
        <PagePills page={page} totalPages={totalPages} onPageChange={onPageChange} />

        <NavBtn
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          title="Page suivante"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </NavBtn>
        <NavBtn
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          title="Dernière page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </NavBtn>
      </div>
    </div>
  );
}

function NavBtn({
  disabled,
  onClick,
  title,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed transition"
    >
      {children}
    </button>
  );
}

/** Renders up to 7 page number pills with ellipsis for large ranges. */
function PagePills({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 4) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 3) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center gap-1">
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`el-${i}`} className="px-1 text-slate-300 text-xs">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`min-w-[28px] rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
              p === page
                ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        )
      )}
    </div>
  );
}
