import type {
  BusinessApplicationInput,
  Locale,
  TourRequest,
  TourRequestInput,
} from "@/lib/types";
import { getTour, quote } from "./catalog";

const STORAGE_KEY = "jol.mock-requests";

function readAll(): TourRequest[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TourRequest[]) : [];
  } catch {
    return [];
  }
}

export async function listRequests(): Promise<TourRequest[]> {
  return readAll();
}

export async function createRequest(
  lang: Locale,
  slug: string,
  input: TourRequestInput,
): Promise<TourRequest> {
  const tour = getTour(lang, slug);
  if (!tour) throw new Error(`Unknown tour: ${slug}`);

  const request: TourRequest = {
    id: crypto.randomUUID(),
    tour: { slug: tour.slug, title: tour.title, photo: tour.photo },
    date: input.date,
    adults: input.adults,
    children: input.children,
    total: quote(slug, input).total,
    status: "new",
    created_at: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([request, ...readAll()]),
    );
  } catch {
    // Storage blocked (private mode): the request still succeeds for this view.
  }
  return request;
}

const BUSINESS_STORAGE_KEY = "jol.mock-business-applications";

export async function saveBusinessApplication(
  input: BusinessApplicationInput,
): Promise<void> {
  try {
    const saved = window.localStorage.getItem(BUSINESS_STORAGE_KEY);
    const all = saved ? (JSON.parse(saved) as BusinessApplicationInput[]) : [];
    window.localStorage.setItem(
      BUSINESS_STORAGE_KEY,
      JSON.stringify([input, ...all]),
    );
  } catch {
    // Storage blocked (private mode): the demo still shows the confirmation.
  }
}
