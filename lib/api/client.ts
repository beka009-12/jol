import type {
  Attachment,
  BusinessApplicationInput,
  ConversationDetail,
  ConversationListItem,
  Departure,
  IdentificationResult,
  Locale,
  PlaceDetail,
  Quote,
  QuoteInput,
  SafetyDetails,
  SafetyDetailsInput,
  TokenResponse,
  TourAvailabilityResponse,
  TourDetail,
  TourRequest,
  TourRequestInput,
} from "@/lib/types";
import { API_PREFIX, DEMO_TOKEN, toQuery, USE_MOCKS } from "./config";
import { ApiError, toApiError } from "./errors";
import { createStreamDecoder } from "./stream";

const BASE = `/backend${API_PREFIX}`;
export const TOKEN_KEY = "jol.token";

export function readToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function isDemoSession(): boolean {
  return readToken() === DEMO_TOKEN;
}

function authHeaders(): Record<string, string> {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function send(path: string, init: RequestInit = {}): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { ...authHeaders(), ...init.headers },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(0, "network", "Network request failed");
  }
  if (!response.ok) throw await toApiError(response);
  return response;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await send(path);
  return (await response.json()) as T;
}

async function sendJson<T>(
  method: "POST" | "PUT",
  path: string,
  body: unknown,
): Promise<T> {
  const response = await send(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as T;
}

export async function signInWithGoogle(idToken: string): Promise<TokenResponse> {
  return sendJson<TokenResponse>("POST", "/auth/google", { id_token: idToken });
}

export async function listConversations(): Promise<ConversationListItem[]> {
  if (isDemoSession()) {
    const mocks = await import("@/lib/mocks/guide");
    return mocks.listConversations();
  }
  return getJson<ConversationListItem[]>("/conversations");
}

export async function createConversation(
  title: string,
): Promise<ConversationListItem> {
  if (isDemoSession()) {
    const mocks = await import("@/lib/mocks/guide");
    return mocks.createConversation(title);
  }
  return sendJson<ConversationListItem>("POST", "/conversations", { title });
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  if (isDemoSession()) {
    const mocks = await import("@/lib/mocks/guide");
    return mocks.getConversation(id);
  }
  return getJson<ConversationDetail>(`/conversations/${id}`);
}

export async function deleteConversation(id: string): Promise<void> {
  if (isDemoSession()) {
    const mocks = await import("@/lib/mocks/guide");
    return mocks.deleteConversation(id);
  }
  await send(`/conversations/${id}`, { method: "DELETE" });
}

export async function streamMessage(
  conversationId: string,
  content: string,
  onText: (text: string) => void,
  signal: AbortSignal,
): Promise<void> {
  if (isDemoSession()) {
    const mocks = await import("@/lib/mocks/guide");
    return mocks.streamMessage(conversationId, content, onText, signal);
  }

  const response = await send(`/conversations/${conversationId}/messages/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
    signal,
  });
  if (!response.body) throw new ApiError(0, "stream", "Empty stream");

  const reader = response.body.getReader();
  const bytes = new TextDecoder();
  const decoder = createStreamDecoder(
    response.headers.get("content-type") ?? "",
  );

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.push(bytes.decode(value, { stream: true }));
    if (text) onText(text);
  }
  const rest = decoder.flush();
  if (rest) onText(rest);
}

export async function uploadAttachment(
  conversationId: string,
  file: Blob,
  fileName: string,
): Promise<Attachment> {
  if (isDemoSession()) {
    const mocks = await import("@/lib/mocks/guide");
    return mocks.uploadAttachment(file, fileName);
  }
  const form = new FormData();
  form.append("file", file, fileName);
  const response = await send(`/conversations/${conversationId}/attachments`, {
    method: "POST",
    body: form,
  });
  return (await response.json()) as Attachment;
}

export async function identifyPlace(
  conversationId: string,
  attachmentId: string,
): Promise<IdentificationResult> {
  if (isDemoSession()) {
    const mocks = await import("@/lib/mocks/guide");
    return mocks.identifyPlace();
  }
  return sendJson<IdentificationResult>(
    "POST",
    `/conversations/${conversationId}/identify`,
    { attachment_id: attachmentId },
  );
}

export async function getSafetyDetails(
  conversationId: string,
): Promise<SafetyDetails | null> {
  if (isDemoSession()) {
    const mocks = await import("@/lib/mocks/guide");
    return mocks.getSafetyDetails(conversationId);
  }
  try {
    return await getJson<SafetyDetails>(
      `/conversations/${conversationId}/safety-details`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function saveSafetyDetails(
  conversationId: string,
  details: SafetyDetailsInput,
): Promise<SafetyDetails> {
  if (isDemoSession()) {
    const mocks = await import("@/lib/mocks/guide");
    return mocks.saveSafetyDetails(conversationId, details);
  }
  return sendJson<SafetyDetails>(
    "PUT",
    `/conversations/${conversationId}/safety-details`,
    details,
  );
}

export async function getTourForCard(
  lang: Locale,
  slug: string,
): Promise<TourDetail | null> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/catalog");
    return mocks.getTour(lang, slug);
  }
  return getJson<TourDetail>(
    `/tours/${encodeURIComponent(slug)}${toQuery({ lang })}`,
  );
}

export async function getPlaceForCard(
  lang: Locale,
  slug: string,
): Promise<PlaceDetail | null> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/catalog");
    return mocks.getPlace(lang, slug);
  }
  return getJson<PlaceDetail>(
    `/places/${encodeURIComponent(slug)}${toQuery({ lang })}`,
  );
}

export async function getTourDepartures(
  slug: string,
  dateFrom: string,
  dateTo: string,
): Promise<Departure[]> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/catalog");
    return mocks.tourAvailability(slug, dateFrom, dateTo).departures;
  }
  const query = toQuery({ date_from: dateFrom, date_to: dateTo });
  const result = await getJson<TourAvailabilityResponse>(
    `/tours/${encodeURIComponent(slug)}/availability${query}`,
  );
  return result.departures;
}

export async function getQuote(
  slug: string,
  input: QuoteInput,
): Promise<Quote> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/catalog");
    return mocks.quote(slug, input);
  }
  return sendJson<Quote>(
    "POST",
    `/tours/${encodeURIComponent(slug)}/quote`,
    input,
  );
}

export async function createTourRequest(
  lang: Locale,
  slug: string,
  input: TourRequestInput,
): Promise<TourRequest> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/requests");
    return mocks.createRequest(lang, slug, input);
  }
  return sendJson<TourRequest>(
    "POST",
    `/tours/${encodeURIComponent(slug)}/requests`,
    input,
  );
}

export async function getMyRequests(lang: Locale): Promise<TourRequest[]> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/requests");
    return mocks.listRequests();
  }
  const result = await getJson<TourRequest[] | { items: TourRequest[] }>(
    `/me/requests${toQuery({ lang })}`,
  );
  return Array.isArray(result) ? result : result.items;
}

export async function submitBusinessApplication(
  input: BusinessApplicationInput,
): Promise<void> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/requests");
    return mocks.saveBusinessApplication(input);
  }
  await sendJson<unknown>("POST", "/business-applications", input);
}
