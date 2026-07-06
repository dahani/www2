import { forwardRef } from "react";
import type { Vente, AppSettings } from "../types";
import { formatMAD, formatDateTime } from "../utils/format";

interface InvoicePrintProps {
  vente: Vente;
  settings: AppSettings;
}

const paiementLabels: Record<string, string> = {
  especes: "Espèces",
  credit: "Crédit",
  carte: "Carte bancaire",
};

const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(({ vente, settings }, ref) => {
  const hasDiscount = vente.discountPercent > 0 || vente.discountAmount > 0;
  return (
    <div ref={ref} id="print-area" className="mx-auto max-w-sm bg-white p-4 text-slate-800 font-mono text-xs">
      <div className="text-center space-y-0.5">
        <p className="text-base font-bold tracking-wide uppercase">{settings.nom}</p>
        {settings.addr && <p>{settings.addr}</p>}
        <p>
          {settings.tel && `Tél: ${settings.tel}`}
          {settings.ice && ` — ICE: ${settings.ice}`}
        </p>
      </div>
      <div className="my-3 border-t border-dashed border-slate-400" />
      <div className="space-y-0.5">
        <p>Facture N°: <span className="font-semibold">{vente.numero}</span></p>
        <p>Date: {formatDateTime(vente.date)}</p>
        <p>Client: {vente.clientNom || "Client comptoir"}</p>
        <p>Paiement: {paiementLabels[vente.modePaiement]}</p>
      </div>
      <div className="my-3 border-t border-dashed border-slate-400" />
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-slate-400">
            <th className="text-left pb-1">Article</th>
            <th className="text-center pb-1">Qté</th>
            <th className="text-right pb-1">P.U</th>
            <th className="text-right pb-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {vente.items.map((it) => (
            <tr key={it.produitId}>
              <td className="py-1 pr-1">{it.nom}</td>
              <td className="py-1 text-center">{it.quantite}</td>
              <td className="py-1 text-right">{it.prix.toFixed(2)}</td>
              <td className="py-1 text-right">{(it.prix * it.quantite).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="my-3 border-t border-dashed border-slate-400" />
      <div className="space-y-0.5">
        {hasDiscount && (
          <>
            <div className="flex justify-between">
              <span>Sous-total</span><span>{formatMAD(vente.sousTotal)}</span>
            </div>
            {vente.discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Remise ({vente.discountPercent}%)</span>
                <span>-{formatMAD((vente.sousTotal * vente.discountPercent) / 100)}</span>
              </div>
            )}
            {vente.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Remise (montant)</span><span>-{formatMAD(vente.discountAmount)}</span>
              </div>
            )}
          </>
        )}
        <div className="flex justify-between text-sm font-bold">
          <span>TOTAL</span><span>{formatMAD(vente.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Payé</span><span>{formatMAD(vente.montantPaye)}</span>
        </div>
        {vente.reste > 0 && (
          <div className="flex justify-between font-semibold text-red-600">
            <span>Reste (crédit)</span><span>{formatMAD(vente.reste)}</span>
          </div>
        )}
      </div>
      <div className="my-3 border-t border-dashed border-slate-400" />
      <p className="text-center">Merci de votre confiance !</p>
      <p className="text-center text-[10px] text-slate-400">Facture générée par {settings.nom}</p>
    </div>
  );
});
InvoicePrint.displayName = "InvoicePrint";
export default InvoicePrint;
