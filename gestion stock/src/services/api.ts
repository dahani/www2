/**
 * REST client for the Symfony 8 backend.
 * ALL data (load + save) goes through the API.
 * Set VITE_API_URL in .env to point to your backend.
 */

import type {
  Fournisseur,
  Client,
  Produit,
  Vente,
  Credit,
  AppSettings,
  VenteItem,
  ModePaiement,
  TypeVente,
  TypePaiementCredit,
} from "../types";
import { useLoading } from "../store/useLoading";

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
export const isApiEnabled = Boolean(API_URL);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("VITE_API_URL non configuré. Ajoutez-le dans votre fichier .env");
  const { start, stop } = useLoading.getState();
  start(`${init?.method ?? "GET"} ${path}`);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      let msg = `Erreur ${res.status}`;
      try { const j = await res.json(); msg = j.error ?? j.message ?? msg; } catch { /* ignore */ }
      throw new Error(msg);
    }
    if (res.status === 204) return undefined as T;
    return await res.json() as T;
  } finally {
    stop();
  }
}

// ---------- Fournisseurs
export const apiFournisseurs = {
  /** Full list (loaded on page mount). */
  list: () => request<Fournisseur[]>("/fournisseurs"),
  /** AJAX search via ?q= — fires after debounce. */
  search: (q: string) =>
    q.trim().length >= 1
      ? request<Fournisseur[]>(`/fournisseurs?q=${encodeURIComponent(q.trim())}`)
      : Promise.resolve([] as Fournisseur[]),
  get: (id: string) => request<Fournisseur>(`/fournisseurs/${id}`),
  create: (data: Omit<Fournisseur, "id" | "createdAt">) =>
    request<Fournisseur>("/fournisseurs", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Omit<Fournisseur, "id" | "createdAt">>) =>
    request<Fournisseur>(`/fournisseurs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/fournisseurs/${id}`, { method: "DELETE" }),
};

// ---------- Clients (lazy — no list, search-only)
export const apiClients = {
  /** Search clients by query string — no query = empty result. */
  search: (q: string) =>
    q.trim().length >= 1
      ? request<Client[]>(`/clients?q=${encodeURIComponent(q.trim())}`)
      : Promise.resolve([] as Client[]),
  get: (id: string) => request<Client>(`/clients/${id}`),
  /** List all clients (used only inside the POS client selector). */
  list: () => request<Client[]>("/clients"),
  create: (data: Omit<Client, "id" | "createdAt">) =>
    request<Client>("/clients", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Omit<Client, "id" | "createdAt">>) =>
    request<Client>(`/clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/clients/${id}`, { method: "DELETE" }),
};

// ---------- Produits
export const apiProduits = {
  /**
   * Paginated + searched list.
   * GET /api/produits?page=1&limit=20&q=...&stock=bas|rupture
   */
  list: (page = 1, limit = 24, q = "", stock: "" | "bas" | "rupture" = "") => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (q.trim()) params.set("q", q.trim());
    if (stock) params.set("stock", stock);
    return request<{ data: Produit[]; total: number }>(`/produits?${params.toString()}`);
  },
  /** Full flat list — used by POS (scan + cart, needs all products loaded). */
  listAll: () => request<Produit[]>("/produits/all"),
  /** Export all products as Excel blob */
  exportExcel: () =>
    fetch(`${API_URL}/produits/export`, {
      headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    }).then((r) => {
      if (!r.ok) throw new Error(`Export failed: ${r.status}`);
      return r.blob();
    }),
  /** Import products from Excel/CSV — returns { imported, errors } */
  importExcel: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ imported: number; errors: string[] }>("/produits/import", {
      method: "POST",
      headers: {},  // let browser set multipart boundary
      body: form,
    });
  },
  findByBarcode: (code: string) => request<Produit>(`/produits/barcode/${encodeURIComponent(code)}`),
  create: (data: Omit<Produit, "id" | "createdAt">) =>
    request<Produit>("/produits", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Omit<Produit, "id" | "createdAt">>) =>
    request<Produit>(`/produits/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/produits/${id}`, { method: "DELETE" }),
};

// ---------- Ventes (full CRUD)
export const apiVentes = {
  list: (page = 1, limit = 20) =>
    request<{ data: Vente[]; total: number }>(`/ventes?page=${page}&limit=${limit}`),
  get: (id: string) => request<Vente>(`/ventes/${id}`),
  create: (data: {
    type: TypeVente;
    clientId?: string;
    clientNom: string;
    items: VenteItem[];
    modePaiement: ModePaiement;
    montantPaye: number;
    discountPercent?: number;
    discountAmount?: number;
  }) => request<Vente>("/ventes", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/ventes/${id}`, { method: "DELETE" }),
};

// ---------- Credits
export const apiCredits = {
  list: () => request<Credit[]>("/credits"),
  addPaiement: (id: string, montant: number, typePaiement: TypePaiementCredit, note?: string) =>
    request<Credit>(`/credits/${id}/paiement`, {
      method: "POST",
      body: JSON.stringify({ montant, typePaiement, note }),
    }),
};

// ---------- Settings
export const apiSettings = {
  get: () => request<AppSettings>("/settings"),
  update: (data: Partial<AppSettings>) =>
    request<AppSettings>("/settings", { method: "PUT", body: JSON.stringify(data) }),
};

// ---------- Produits top vendus (pour le POS)
export const apiTopProduits = {
  get: (limit = 12) => request<Produit[]>(`/produits/top?limit=${limit}`),
};

// ---------- Stats
export interface ApiStats {
  chiffreAffaires: number;
  valeurStock: number;
  creditsEnCours: number;
  nbVentes: number;
  nbProduits: number;
  lowStock: Produit[];
}
export const apiStats = { get: () => request<ApiStats>("/stats") };
