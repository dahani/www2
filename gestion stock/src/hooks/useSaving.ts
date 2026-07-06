import { useState, useCallback } from "react";

/**
 * Returns `[saving, runSave]`.
 *
 * Call `runSave(fn)` with any sync or async function — it will set
 * `saving = true` while the function executes and reset it when done.
 *
 * For pure localStorage operations (synchronous), a brief artificial delay
 * (200 ms) gives tactile feedback before the modal closes.
 */
export function useSaving() {
  const [saving, setSaving] = useState(false);

  const runSave = useCallback(async (fn: () => void | Promise<void>) => {
    setSaving(true);
    try {
      // If the fn is synchronous (localStorage store), add a brief visual
      // delay so the spinner is actually visible.
      const result = fn();
      if (result instanceof Promise) {
        await result;
      } else {
        await new Promise((r) => setTimeout(r, 220));
      }
    } finally {
      setSaving(false);
    }
  }, []);

  return [saving, runSave] as const;
}
