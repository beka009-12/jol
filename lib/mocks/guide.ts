import type {
  Attachment,
  ChatMessage,
  ConversationDetail,
  ConversationListItem,
  IdentificationResult,
  SafetyDetails,
  SafetyDetailsInput,
} from "@/lib/types";
import { ApiError } from "@/lib/api/errors";

/*
  Used only for the demo sign-in (mocks on, no Google client id). Lives in
  memory, so a reload starts a new chat; real sessions never reach this file.
*/

const CHUNK_DELAY_MS = 28;

const conversations = new Map<string, ConversationDetail>();
const safety = new Map<string, SafetyDetails>();

function isRussian(text: string): boolean {
  return /[а-яё]/i.test(text);
}

function replyTo(question: string): string {
  const wantsSki = /ski|лыж|сноуборд|snowboard|декабр|december/i.test(question);
  const wantsYurt = /yurt|юрт|horse|конн|лошад/i.test(question);
  const wantsStayOrFood =
    /останов|пожить|отел|гостев|жиль|поесть|ресторан|кафе|stay|hotel|guesthouse|eat|restaurant|cafe/i.test(
      question,
    );

  if (isRussian(question)) {
    if (wantsStayOrFood) {
      return "В Караколе удобно остановиться в гостевом доме **«Три ели»** рядом с центром, а поесть в кафе **«Ашлянфу у рынка»**: это местное блюдо, которое стоит попробовать.\n\nВсё жильё и заведения собраны в разделах «Жильё» и «Еда».";
    }
    if (wantsSki) {
      return "Для лыж в декабре лучше всего **Каракол**: самые длинные трассы в стране, а сезон открывается в начале месяца.\n\n- Выходные подойдут, если времени мало\n- Неделя стоит того, если хотите прогрессировать\n\n[[tour:karakol-ski-weekend]] [[tour:karakol-ski-week]]";
    }
    if (wantsYurt) {
      return "Самый простой вариант с юртой и лошадьми это **Сон-Куль**. Сезон с июня по сентябрь, ночи холодные даже летом.\n\n[[tour:song-kol-yurt-stay]] [[place:song-kol]]";
    }
    return "Сейчас межсезонье, но многое открыто. Загляните в **Ала-Арчу** на день или съездите на горячие источники **Алтын-Арашана**.\n\n[[tour:altyn-arashan-springs]] [[place:ala-archa]]";
  }

  if (wantsStayOrFood) {
    return "In Karakol, **Three Spruces Guesthouse** is a comfortable base near the centre, and **Market Ashlan-Fu** serves the local dish worth trying.\n\nAll the stays and places to eat are in the Stays and Food sections.";
  }
  if (wantsSki) {
    return "For skiing in December, go to **Karakol**: it has the longest pistes in the country and the season opens early in the month.\n\n- Take the weekend if you're short on time\n- Take the full week if you want to improve\n\n[[tour:karakol-ski-weekend]] [[tour:karakol-ski-week]]";
  }
  if (wantsYurt) {
    return "The easiest way to combine yurts and horses is **Song-Kol**. The season runs June to September, and nights are cold even in summer.\n\n[[tour:song-kol-yurt-stay]] [[place:song-kol]]";
  }
  return "It's the low season, but plenty is still open. Spend a day in **Ala-Archa** or go up to the hot springs at **Altyn Arashan**.\n\n[[tour:altyn-arashan-springs]] [[place:ala-archa]]";
}

function message(role: string, content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    status: "complete",
    created_at: new Date().toISOString(),
  };
}

function requireConversation(id: string): ConversationDetail {
  const conversation = conversations.get(id);
  if (!conversation) throw new ApiError(404, "not_found", "Conversation not found");
  return conversation;
}

export async function listConversations(): Promise<ConversationListItem[]> {
  return [...conversations.values()].reverse();
}

export async function createConversation(
  title: string,
): Promise<ConversationListItem> {
  const now = new Date().toISOString();
  const conversation: ConversationDetail = {
    id: crypto.randomUUID(),
    title,
    identified_place_id: null,
    created_at: now,
    updated_at: now,
    messages: [],
  };
  conversations.set(conversation.id, conversation);
  return conversation;
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  return requireConversation(id);
}

export async function deleteConversation(id: string): Promise<void> {
  conversations.delete(id);
  safety.delete(id);
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export async function streamMessage(
  conversationId: string,
  content: string,
  onText: (text: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const conversation = requireConversation(conversationId);
  conversation.messages.push(message("user", content));

  const reply = replyTo(content);
  await wait(450, signal);
  for (const piece of reply.match(/\S+\s*/g) ?? []) {
    onText(piece);
    await wait(CHUNK_DELAY_MS, signal);
  }
  conversation.messages.push(message("assistant", reply));
}

export async function uploadAttachment(
  file: Blob,
  fileName: string,
): Promise<Attachment> {
  return {
    id: crypto.randomUUID(),
    object_key: `demo/${fileName}`,
    original_name: fileName,
    content_type: file.type,
    size_bytes: file.size,
  };
}

export async function identifyPlace(): Promise<IdentificationResult> {
  const place = (
    slug: string,
    nameEn: string,
    nameRu: string,
    latitude: number,
    longitude: number,
  ) => ({
    id: crypto.randomUUID(),
    slug,
    name_en: nameEn,
    name_ru: nameRu,
    description_en: "",
    description_ru: "",
    latitude,
    longitude,
    best_season: "",
    transport_advice: "",
    packing_advice: "",
  });

  await new Promise((resolve) => setTimeout(resolve, 900));
  return {
    status: "identified",
    confidence: 0.86,
    reason: "Demo result: the sample answer is the same for every photo.",
    place: place("song-kol", "Song-Kol", "Сон-Куль", 41.83, 75.13),
    alternatives: [place("issyk-kul", "Issyk-Kul", "Иссык-Куль", 42.45, 77.25)],
  };
}

export async function getSafetyDetails(
  conversationId: string,
): Promise<SafetyDetails | null> {
  return safety.get(conversationId) ?? null;
}

export async function saveSafetyDetails(
  conversationId: string,
  details: SafetyDetailsInput,
): Promise<SafetyDetails> {
  const now = new Date().toISOString();
  const saved: SafetyDetails = {
    ...details,
    id: safety.get(conversationId)?.id ?? crypto.randomUUID(),
    created_at: safety.get(conversationId)?.created_at ?? now,
    updated_at: now,
  };
  safety.set(conversationId, saved);
  return saved;
}
