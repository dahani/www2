declare module "onscan.js" {
  interface OnScanOptions {
    suffixKeyCodes?: number[];
    prefixKeyCodes?: number[];
    reactToPaste?: boolean;
    minLength?: number;
    avgTimeByChar?: number;
    onScan?: (sScanned: string, iQty: number) => void;
    onScanError?: (oDebug: unknown) => void;
    onKeyDetect?: (iKeyCode: number, oEvent: KeyboardEvent) => void;
    onKeyProcess?: (sChar: string, oEvent: KeyboardEvent) => void;
    onPaste?: (sPasted: string) => void;
  }

  interface OnScan {
    attachTo(element: Document | HTMLElement, options?: OnScanOptions): void;
    detachFrom(element: Document | HTMLElement): void;
  }

  const onScan: OnScan;
  export default onScan;
}
