import { useEffect, useRef } from "react";

/**
 * Listens for physical barcode scanner input via onScan.js.
 *
 * Key rule: the callback is NEVER fired when the user is actively typing
 * in any <input>, <textarea>, or <select> element. This prevents the hook
 * from intercepting normal keyboard input (e.g. typing in an address field).
 *
 * Hardware scanners are distinguished from keyboard by typing speed:
 * they send all characters in < 40 ms/char and terminate with Enter.
 *
 * @param onDetected  Called with the scanned barcode string.
 * @param enabled     Set to false to completely pause listening.
 */
export function useHardwareScanner(
  onDetected: (code: string) => void,
  enabled = true
) {
  const callbackRef = useRef(onDetected);
  callbackRef.current = onDetected;

  useEffect(() => {
    if (!enabled) return;

    /** Returns true when the user is focused on an editable element. */
    function isInputFocused(): boolean {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return true;
      // Also catch contenteditable
      if ((el as HTMLElement).isContentEditable) return true;
      return false;
    }

    let onScanInstance: { detachFrom: (el: Document) => void } | null = null;

    import("onscan.js")
      .then((mod) => {
        const onScan = mod.default ?? mod;

        onScan.attachTo(document, {
          suffixKeyCodes: [13],   // scanner ends with Enter
          reactToPaste: true,     // support paste-mode scanners
          minLength: 3,           // ignore very short accidentals
          avgTimeByChar: 40,      // scanners type faster than 40 ms/char

          onScan: (sCode: string) => {
            // ✅ Only fire if NO input is currently focused
            if (isInputFocused()) return;
            callbackRef.current(sCode.trim());
          },

          // Suppress the onScan event entirely when an input is focused
          onKeyDetect: (_keyCode: number, oEvent: KeyboardEvent) => {
            if (isInputFocused()) {
              oEvent.stopPropagation();
            }
          },
        });

        onScanInstance = onScan;
      })
      .catch(() => {
        // Fallback: manual keydown buffer when onscan.js fails to load
        let buffer = "";
        let lastKeyTime = 0;
        let timer: ReturnType<typeof setTimeout> | null = null;

        function onKeyDown(e: KeyboardEvent) {
          // Ignore completely when an input is focused
          if (isInputFocused()) {
            buffer = "";
            return;
          }

          const now = Date.now();
          const delta = now - lastKeyTime;
          lastKeyTime = now;

          // If gap between keys is too large → reset (human typing, not scanner)
          if (delta > 60 && buffer.length > 0) {
            buffer = "";
          }

          if (e.key === "Enter") {
            if (buffer.length >= 3) {
              callbackRef.current(buffer.trim());
            }
            buffer = "";
            return;
          }

          if (e.key.length === 1) {
            buffer += e.key;
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => { buffer = ""; }, 120);
          }
        }

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
      });

    return () => {
      if (onScanInstance) {
        try { onScanInstance.detachFrom(document); } catch { /* ignore */ }
      }
    };
  }, [enabled]);
}
