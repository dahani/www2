export type ModePaiement = "especes" | "credit" | "carte";
export type TypePaiementCredit = "especes" | "cheque" | "carte";
export type TypeVente = "comptoir" | "client";
export type StatutVente = "payee" | "partielle" | "impayee";
export type StatutCredit = "ouvert" | "solde";

export interface Fournisseur {
  id: string;
  nom: string;
  tel: string;
  email: string;
  ice: string;
  addr: string;
  createdAt: string;
}

export interface Client {
  id: string;
  nom: string;
  tel: string;
  addr: string;
  email: string;
  createdAt: string;
}

export interface Produit {
  id: string;
  nom: string;
  codeBarre: string;
  quantite: number;
  prix: number;
  prixAchat: number;
  couleur: string;
  poids: number;
  stockMin: number;
  categorie: string;
  fournisseurId?: string;
  createdAt: string;
}

export interface VenteItem {
  produitId: string;
  nom: string;
  codeBarre: string;
  prix: number;
  quantite: number;
}

export interface Vente {
  id: string;
  numero: string;
  date: string;
  type: TypeVente;
  clientId?: string;
  clientNom: string;
  items: VenteItem[];
  sousTotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  modePaiement: ModePaiement;
  montantPaye: number;
  reste: number;
  statut: StatutVente;
}

export interface AppSettings {
  nom: string;
  tel: string;
  addr: string;
  email: string;
  ice: string;
}

export interface PaiementCredit {
  id: string;
  date: string;
  montant: number;
  typePaiement: TypePaiementCredit;
  note?: string;
}

export interface Credit {
  id: string;
  clientId: string;
  clientNom: string;
  venteId: string;
  venteNumero: string;
  montantTotal: number;
  montantPaye: number;
  date: string;
  paiements: PaiementCredit[];
  statut: StatutCredit;
}
