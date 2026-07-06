import * as XLSX from "xlsx";
import type { Produit } from "../types";

/** Column headers used in both template and export. */
const HEADERS = [
  "nom",
  "codeBarre",
  "quantite",
  "prix",
  "prixAchat",
  "couleur",
  "poids",
  "stockMin",
  "categorie",
];

const HEADER_LABELS: Record<string, string> = {
  nom: "Nom *",
  codeBarre: "Code-barre",
  quantite: "Quantité",
  prix: "Prix vente (MAD)",
  prixAchat: "Prix achat (MAD)",
  couleur: "Couleur",
  poids: "Poids (kg)",
  stockMin: "Stock minimum",
  categorie: "Catégorie",
};

/** Download an empty Excel template with labelled column headers. */
export function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([HEADERS.map((h) => HEADER_LABELS[h])]);
  // Style column widths
  ws["!cols"] = HEADERS.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produits");
  XLSX.writeFile(wb, "template_produits.xlsx");
}

/** Export a list of products to Excel and trigger download. */
export function exportProduits(produits: Produit[]) {
  const rows = produits.map((p) => ({
    [HEADER_LABELS.nom]: p.nom,
    [HEADER_LABELS.codeBarre]: p.codeBarre ?? "",
    [HEADER_LABELS.quantite]: p.quantite,
    [HEADER_LABELS.prix]: p.prix,
    [HEADER_LABELS.prixAchat]: p.prixAchat,
    [HEADER_LABELS.couleur]: p.couleur ?? "",
    [HEADER_LABELS.poids]: p.poids,
    [HEADER_LABELS.stockMin]: p.stockMin,
    [HEADER_LABELS.categorie]: p.categorie ?? "",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = HEADERS.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produits");
  XLSX.writeFile(wb, `produits_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export interface ImportedRow {
  nom: string;
  codeBarre: string;
  quantite: number;
  prix: number;
  prixAchat: number;
  couleur: string;
  poids: number;
  stockMin: number;
  categorie: string;
}

/**
 * Parse an Excel or CSV file and return rows ready to POST to the API.
 * Accepts both the label-based headers (from our template) and the raw
 * key-based headers (nom, codeBarre, …).
 */
export function parseImportFile(file: File): Promise<ImportedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

        const rows: ImportedRow[] = raw.map((row, i) => {
          // Accept both "Nom *" and "nom" as the key
          const get = (key: string, label: string): string =>
            String(row[label] ?? row[key] ?? "").trim();
          const getNum = (key: string, label: string): number =>
            Number(row[label] ?? row[key] ?? 0) || 0;

          const nom = get("nom", HEADER_LABELS.nom);
          if (!nom) throw new Error(`Ligne ${i + 2} : le champ "Nom" est vide.`);

          return {
            nom,
            codeBarre: get("codeBarre", HEADER_LABELS.codeBarre),
            quantite: getNum("quantite", HEADER_LABELS.quantite),
            prix: getNum("prix", HEADER_LABELS.prix),
            prixAchat: getNum("prixAchat", HEADER_LABELS.prixAchat),
            couleur: get("couleur", HEADER_LABELS.couleur),
            poids: getNum("poids", HEADER_LABELS.poids),
            stockMin: getNum("stockMin", HEADER_LABELS.stockMin),
            categorie: get("categorie", HEADER_LABELS.categorie),
          };
        });

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Lecture du fichier échouée"));
    reader.readAsArrayBuffer(file);
  });
}
