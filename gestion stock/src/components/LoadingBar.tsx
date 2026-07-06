import { useEffect, useState } from "react";
import { useLoading } from "../store/useLoading";

/**
 * Slim indeterminate progress bar that appears at the very top of the viewport
 * whenever at least one API request (or `withLoading()` call) is in flight.
 */
export default function LoadingBar() {
  const pending = useLoading((s) => s.pending);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pending > 0) {
      setVisible(true);
      return;
    }
    // Small fade-out delay so quick requests still flash the bar.
    const t = setTimeout(() => setVisible(false), 250);
    return () => clearTimeout(t);
  }, [pending]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden bg-transparent no-print pointer-events-none">
      <div
        className="h-full w-1/3 rounded-r-full shadow-[0_0_10px_currentColor]"
        style={{
          backgroundColor: "var(--color-indigo-600, #4f46e5)",
          color: "var(--color-indigo-500, #6366f1)",
          animation: "stockpro-progress 1.1s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes stockpro-progress {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(150%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
