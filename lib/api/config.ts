export const API_PREFIX = "/api/v1";
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/** Local sign-in used only when mocks are on and Google isn't configured yet. */
export const DEMO_AUTH_AVAILABLE = USE_MOCKS && !GOOGLE_CLIENT_ID;
export const DEMO_TOKEN = "demo-session";

export function toQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}
