/**
 * Thin client for the CA Pharmacy API.
 *
 * The base URL comes from Vite's `VITE_API_BASE_URL` (see frontend/.env), with a
 * sensible localhost default so `npm run dev` works with `docker compose up`.
 * Every helper unwraps the `{ data: ... }` success envelope and throws an
 * `ApiError` carrying the server's `{ status, message, fields }` on failure.
 */

const API_BASE = (
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof window !== "undefined" && window.__API_BASE__) ||
  "http://localhost:8080"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status, message, fields = null) {
    super(message || `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, { method = "GET", body, query } = {}) {
  let url = `${API_BASE}${path}`;

  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });
    const qs = params.toString();
    if (qs) {
      url += `?${qs}`;
    }
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new ApiError(0, `Cannot reach the API at ${API_BASE}. Is it running?`);
  }

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload && payload.error ? payload.error : {};
    throw new ApiError(response.status, error.message, error.fields || null);
  }

  return payload ? payload.data : null;
}

export const api = {
  dashboard: () => request("/api/dashboard"),

  medications: (query) => request("/api/medications", { query }),
  medication: (id) => request(`/api/medications/${id}`),
  createMedication: (body) => request("/api/medications", { method: "POST", body }),
  adjustStock: (id, delta, reason) =>
    request(`/api/medications/${id}/stock`, { method: "POST", body: { delta, reason } }),
  categories: () => request("/api/medications/categories"),

  patients: (search) => request("/api/patients", { query: { search } }),
  patient: (id) => request(`/api/patients/${id}`),
  createPatient: (body) => request("/api/patients", { method: "POST", body }),

  suppliers: () => request("/api/suppliers"),

  prescriptions: (query) => request("/api/prescriptions", { query }),
  createPrescription: (body) => request("/api/prescriptions", { method: "POST", body }),
  transitionPrescription: (id, state) =>
    request(`/api/prescriptions/${id}/state`, { method: "PATCH", body: { state } }),

  purchaseOrders: (query) => request("/api/purchase-orders", { query }),
  purchaseOrder: (id) => request(`/api/purchase-orders/${id}`),
  createPurchaseOrder: (body) => request("/api/purchase-orders", { method: "POST", body }),
  transitionPurchaseOrder: (id, state) =>
    request(`/api/purchase-orders/${id}/state`, { method: "PATCH", body: { state } }),

  sales: (query) => request("/api/sales", { query }),
  createSale: (body) => request("/api/sales", { method: "POST", body }),
  voidSale: (id) => request(`/api/sales/${id}/void`, { method: "POST" }),
};

// ---------------------------------------------------------------------------
// Shared presentation helpers
// ---------------------------------------------------------------------------

export const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** Map a derived stock status to a status-badge tone class. */
export const STATUS_TONE = {
  in: "status-success",
  low: "status-warning",
  out: "status-danger",
  expiring: "status-warning",
  expired: "status-danger",
  recalled: "status-danger",
  controlled: "status-controlled",
  // prescription / order / sale states
  new: "status-neutral",
  verifying: "status-info",
  ready: "status-success",
  dispensed: "status-success",
  voided: "status-danger",
  draft: "status-neutral",
  submitted: "status-info",
  transit: "status-warning",
  received: "status-success",
  cancelled: "status-danger",
  completed: "status-success",
};

export function toneClass(key) {
  return STATUS_TONE[key] || "status-neutral";
}

/** "2026-08-12" -> "12 Aug 2026". Returns "—" for empty values. */
export function formatDate(iso) {
  if (!iso) {
    return "—";
  }
  const date = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return String(iso);
  }
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Initials for an avatar, e.g. "Amara Okafor" -> "AO". */
export function initials(name) {
  return String(name || "")
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
