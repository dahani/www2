import { useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import Modal from "./Modal";
import { ScanLine } from "lucide-react";

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
}

const MOUNT_ID = "barcode-scanner-region";

export default function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      const el = document.getElementById(MOUNT_ID);
      if (!el) return;
      const scanner = new Html5QrcodeScanner(
        MOUNT_ID,
        {
          fps: 10,
          qrbox: { width: 260, height: 160 },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
        },
        false
      );
      scanner.render(
        (decodedText) => {
          onDetected(decodedText);
        },
        () => {
          // ignore per-frame scan errors
        }
      );
      scannerRef.current = scanner;
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
          });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    if (scannerRef.current) {
      scannerRef.current
        .clear()
        .catch(() => {})
        .finally(() => {
          scannerRef.current = null;
          onClose();
        });
    } else {
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Scanner un code-barres / QR code" size="md">
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          <ScanLine className="h-4 w-4 shrink-0" />
          <span>Placez le code-barres ou QR code du produit devant la caméra.</span>
        </div>
        <div id={MOUNT_ID} className="overflow-hidden rounded-xl" />
        <p className="text-xs text-slate-400">
          Astuce : si aucune caméra n'est détectée, vous pouvez saisir le code manuellement dans le champ de
          recherche.
        </p>
      </div>
    </Modal>
  );
}
