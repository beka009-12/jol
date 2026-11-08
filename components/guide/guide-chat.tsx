"use client";

import Image from "next/image";
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUp,
  Camera,
  History,
  ShieldCheck,
  Square,
  SquarePen,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth-provider";
import { BottomSheet } from "@/components/bottom-sheet";
import { ErrorState } from "@/components/error-state";
import { SignInPanel } from "@/components/sign-in-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@/i18n/navigation";
import {
  createConversation,
  getConversation,
  identifyPlace,
  streamMessage,
  uploadAttachment,
} from "@/lib/api/client";
import { isNotFound, isUnauthorized } from "@/lib/api/errors";
import { parseMessage } from "@/lib/chat-refs";
import { resizeImage } from "@/lib/resize-image";
import type { ChatMessage, IdentificationResult } from "@/lib/types";
import { ChatCards } from "./chat-cards";
import { HistorySheet } from "./history-sheet";
import { IdentifyResult } from "./identify-result";
import { MessageText } from "./message-text";
import { SafetySheet } from "./safety-sheet";
import { TypingIndicator } from "./typing-indicator";

const CONVERSATION_KEY = "jol.conversation";
const TITLE_LENGTH = 80;
const STICK_TO_BOTTOM_PX = 160;

function readStoredConversation(): string | null {
  try {
    return window.localStorage.getItem(CONVERSATION_KEY);
  } catch {
    return null;
  }
}

function storeConversation(id: string | null): void {
  try {
    if (id) window.localStorage.setItem(CONVERSATION_KEY, id);
    else window.localStorage.removeItem(CONVERSATION_KEY);
  } catch {
    // Storage blocked: the chat works, it just won't reopen after a reload.
  }
}

interface TextItem {
  kind: "text";
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "done" | "streaming" | "error" | "stopped";
  /** The question an assistant reply answers, so it can be retried. */
  question?: string;
}

interface PhotoItem {
  kind: "photo";
  id: string;
  previewUrl: string;
  file: File;
  status: "checking" | "done" | "error";
  result?: IdentificationResult;
}

type ChatItem = TextItem | PhotoItem;

type PendingAction =
  | { type: "text"; content: string }
  | { type: "photo"; file: File }
  | { type: "safety" };

let itemCounter = 0;
function nextItemId(): string {
  itemCounter += 1;
  return `item-${itemCounter}`;
}

function toItems(messages: ChatMessage[]): ChatItem[] {
  return messages.map((message) => ({
    kind: "text",
    id: message.id,
    role: message.role === "user" ? "user" : "assistant",
    content: message.content,
    status: "done",
  }));
}

function ChatSkeleton() {
  return (
    <div className="flex-1 space-y-6 py-4" aria-hidden>
      <Skeleton className="ml-auto h-12 w-3/5 rounded-2xl" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-5 w-3/5" />
    </div>
  );
}

// The bottom padding keeps the sticky composer from covering the last message.
const SHELL =
  "mx-auto flex min-h-dvh w-full max-w-[720px] flex-col px-4 pb-[calc(var(--nav-height)+env(safe-area-inset-bottom))] lg:min-h-[calc(100dvh-var(--header-height))] lg:px-6 lg:pb-0";

interface ChatSessionProps {
  conversationId: string | null;
  initialMessages: ChatMessage[];
  initialQuestion?: string;
  photoPrompt: boolean;
  onConversationChange: (id: string | null) => void;
  onReset: (id: string | null) => void;
}

function ChatSession({
  conversationId,
  initialMessages,
  initialQuestion,
  photoPrompt,
  onConversationChange,
  onReset,
}: ChatSessionProps) {
  const t = useTranslations("Guide");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isSignedIn, signOut } = useAuth();

  const [items, setItems] = useState<ChatItem[]>(() =>
    toItems(initialMessages),
  );
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [activeId, setActiveId] = useState(conversationId);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const conversationRef = useRef(conversationId);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pinnedRef = useRef(true);
  const previewUrls = useRef<string[]>([]);

  useEffect(() => {
    const onScroll = () => {
      pinnedRef.current =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - STICK_TO_BOTTOM_PX;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pinnedRef.current && items.length > 0) {
      window.scrollTo({ top: document.documentElement.scrollHeight });
    }
  }, [items]);

  useEffect(() => {
    const urls = previewUrls.current;
    return () => {
      abortRef.current?.abort();
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const updateItem = (id: string, patch: (item: ChatItem) => ChatItem) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? patch(item) : item)),
    );
  };

  const ensureConversation = async (title: string): Promise<string> => {
    if (conversationRef.current) return conversationRef.current;
    const created = await createConversation(
      title.slice(0, TITLE_LENGTH) || t("newChatTitle"),
    );
    conversationRef.current = created.id;
    setActiveId(created.id);
    onConversationChange(created.id);
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    return created.id;
  };

  // Expired session: ask to sign in again, then redo what was being attempted.
  const resumeAfterSignIn = (action: PendingAction) => {
    signOut();
    setPending(action);
  };

  const streamAnswer = async (question: string, assistantId: string) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    pinnedRef.current = true;

    try {
      const id = await ensureConversation(question);
      await streamMessage(
        id,
        question,
        (text) => {
          updateItem(assistantId, (item) =>
            item.kind === "text"
              ? { ...item, content: item.content + text }
              : item,
          );
        },
        controller.signal,
      );
      updateItem(assistantId, (item) =>
        item.kind === "text" ? { ...item, status: "done" } : item,
      );
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (error) {
      if (isUnauthorized(error)) {
        setItems((current) => {
          const index = current.findIndex((item) => item.id === assistantId);
          return current.filter((_, i) => i !== index && i !== index - 1);
        });
        resumeAfterSignIn({ type: "text", content: question });
        return;
      }
      const aborted =
        error instanceof DOMException && error.name === "AbortError";
      updateItem(assistantId, (item) =>
        item.kind === "text"
          ? { ...item, status: aborted ? "stopped" : "error" }
          : item,
      );
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  };

  const sendText = (content: string) => {
    const assistantId = nextItemId();
    setItems((current) => [
      ...current,
      {
        kind: "text",
        id: nextItemId(),
        role: "user",
        content,
        status: "done",
      },
      {
        kind: "text",
        id: assistantId,
        role: "assistant",
        content: "",
        status: "streaming",
        question: content,
      },
    ]);
    void streamAnswer(content, assistantId);
  };

  const retryAnswer = (item: TextItem) => {
    if (!item.question) return;
    updateItem(item.id, (current) =>
      current.kind === "text"
        ? { ...current, content: "", status: "streaming" }
        : current,
    );
    void streamAnswer(item.question, item.id);
  };

  const checkPhoto = async (photoId: string, file: File) => {
    try {
      const id = await ensureConversation(file.name);
      const blob = await resizeImage(file);
      const attachment = await uploadAttachment(
        id,
        blob,
        blob === file ? file.name : "photo.jpg",
      );
      const result = await identifyPlace(id, attachment.id);
      updateItem(photoId, (item) =>
        item.kind === "photo" ? { ...item, status: "done", result } : item,
      );
    } catch (error) {
      if (isUnauthorized(error)) {
        setItems((current) => current.filter((item) => item.id !== photoId));
        resumeAfterSignIn({ type: "photo", file });
        return;
      }
      updateItem(photoId, (item) =>
        item.kind === "photo" ? { ...item, status: "error" } : item,
      );
    }
  };

  const sendPhoto = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    previewUrls.current.push(previewUrl);
    const id = nextItemId();
    pinnedRef.current = true;
    setItems((current) => [
      ...current,
      { kind: "photo", id, previewUrl, file, status: "checking" },
    ]);
    void checkPhoto(id, file);
  };

  const openSafety = async () => {
    try {
      await ensureConversation(t("newChatTitle"));
      setSafetyOpen(true);
    } catch (error) {
      if (isUnauthorized(error)) {
        resumeAfterSignIn({ type: "safety" });
        return;
      }
      setPhotoError(t("safetyError"));
    }
  };

  const run = (action: PendingAction) => {
    if (action.type === "text") sendText(action.content);
    else if (action.type === "photo") sendPhoto(action.file);
    else void openSafety();
  };

  const perform = (action: PendingAction) => {
    if (isSignedIn) run(action);
    else setPending(action);
  };

  const autoAsk = useEffectEvent(() => {
    if (initialQuestion) {
      perform({ type: "text", content: initialQuestion });
    }
    if (initialQuestion || photoPrompt) router.replace("/guide");
  });
  const autoAsked = useRef(false);
  useEffect(() => {
    if (autoAsked.current) return;
    autoAsked.current = true;
    autoAsk();
  }, []);

  const submitDraft = () => {
    const content = draft.trim();
    if (!content || busy) return;
    setDraft("");
    perform({ type: "text", content });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitDraft();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      submitDraft();
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError(t("photoNotImage"));
      return;
    }
    setPhotoError(null);
    perform({ type: "photo", file });
  };

  const closeSignIn = (open: boolean) => {
    if (open) return;
    if (pending?.type === "text") setDraft(pending.content);
    setPending(null);
  };

  const handleSignedIn = () => {
    const action = pending;
    setPending(null);
    if (action) run(action);
  };

  const signInTitle =
    pending?.type === "photo"
      ? t("signInPhotoTitle")
      : pending?.type === "safety"
        ? t("signInSafetyTitle")
        : t("signInTitle");

  const suggestions = [
    t("suggestion1"),
    t("suggestion2"),
    t("suggestion3"),
    t("suggestion4"),
  ];

  return (
    <div className={SHELL}>
      <header className="flex min-h-14 items-center justify-between gap-2 pt-2 lg:pt-4">
        <h1 className="text-lg font-bold lg:text-xl">{t("title")}</h1>
        <div className="-mr-2 flex">
          <Button
            variant="ghost"
            className="px-2 text-sm"
            onClick={() => perform({ type: "safety" })}
          >
            <ShieldCheck aria-hidden />
            {t("safetyOpen")}
          </Button>
          {isSignedIn && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("history")}
              title={t("history")}
              onClick={() => setHistoryOpen(true)}
            >
              <History aria-hidden />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("newChat")}
            title={t("newChat")}
            disabled={items.length === 0}
            onClick={() => onReset(null)}
          >
            <SquarePen aria-hidden />
          </Button>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col justify-end gap-6 py-4">
          {photoPrompt ? (
            <div>
              <h2 className="text-xl font-bold text-balance">
                {t("photoPrompt")}
              </h2>
              <Button
                size="lg"
                className="mt-4 w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera aria-hidden />
                {t("photoChoose")}
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-balance">
                {t("emptyTitle")}
              </h2>
              <p className="mt-1 max-w-[50ch] text-muted-foreground">
                {t("emptyBody")}
              </p>
            </div>
          )}
          <ul aria-label={t("suggestionsLabel")} className="grid gap-2 sm:grid-cols-2">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => perform({ type: "text", content: suggestion })}
                  className="min-h-12 w-full rounded-xl bg-secondary px-4 py-3 text-left text-sm font-medium transition-colors duration-150 hover:bg-accent active:bg-accent"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          role="log"
          aria-busy={busy}
          aria-label={t("title")}
          className="flex-1 space-y-6 py-4"
        >
          {items.map((item) => {
            if (item.kind === "photo") {
              return (
                <div key={item.id} className="space-y-3">
                  <div className="relative ml-auto aspect-[4/3] w-3/5 max-w-[280px] overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={item.previewUrl}
                      alt={t("photoAlt")}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  {item.status === "checking" && (
                    <TypingIndicator label={t("photoChecking")} showLabel />
                  )}
                  {item.status === "done" && item.result && (
                    <IdentifyResult result={item.result} />
                  )}
                  {item.status === "error" && (
                    <ErrorState
                      title={t("photoError")}
                      onRetry={() => {
                        updateItem(item.id, (current) =>
                          current.kind === "photo"
                            ? { ...current, status: "checking" }
                            : current,
                        );
                        void checkPhoto(item.id, item.file);
                      }}
                    />
                  )}
                </div>
              );
            }

            if (item.role === "user") {
              return (
                <p
                  key={item.id}
                  className="ml-auto w-fit max-w-[85%] rounded-2xl bg-secondary px-4 py-3 whitespace-pre-wrap"
                >
                  {item.content}
                </p>
              );
            }

            const { text, refs } = parseMessage(item.content);
            return (
              <div key={item.id}>
                {text && <MessageText text={text} />}
                {item.status === "streaming" && !text && (
                  <TypingIndicator label={t("typing")} />
                )}
                {item.status !== "streaming" && <ChatCards refs={refs} />}
                {item.status === "stopped" && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("stopped")}
                  </p>
                )}
                {item.status === "error" && (
                  <ErrorState
                    title={t("sendError")}
                    className="mt-2"
                    onRetry={() => retryAnswer(item)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="sticky bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom))] z-20 -mx-4 bg-background px-4 pt-1 pb-3 lg:bottom-0 lg:mx-0 lg:px-0 lg:pb-6">
        {photoError && (
          <p role="alert" className="mb-2 text-sm text-destructive">
            {photoError}
          </p>
        )}
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-1 rounded-2xl border border-input bg-card p-1 focus-within:border-foreground"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("attach")}
            title={t("attach")}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera aria-hidden />
          </Button>
          <label htmlFor="guide-input" className="sr-only">
            {t("inputLabel")}
          </label>
          <textarea
            id="guide-input"
            rows={1}
            value={draft}
            maxLength={10000}
            enterKeyHint="send"
            placeholder={t("inputPlaceholder")}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            className="field-sizing-content max-h-32 min-h-11 flex-1 resize-none bg-transparent px-1 py-3 text-base outline-none placeholder:text-muted-foreground"
          />
          {busy ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label={t("stop")}
              title={t("stop")}
              onClick={() => abortRef.current?.abort()}
            >
              <Square className="fill-current" aria-hidden />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              aria-label={t("send")}
              title={t("send")}
              disabled={!draft.trim()}
              className="disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-100"
            >
              <ArrowUp aria-hidden />
            </Button>
          )}
        </form>
      </div>

      <BottomSheet
        open={pending !== null && !isSignedIn}
        onOpenChange={closeSignIn}
        title={signInTitle}
        description={t("signInBody")}
      >
        <SignInPanel onSignedIn={handleSignedIn} />
      </BottomSheet>

      {isSignedIn && (
        <HistorySheet
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          currentId={activeId}
          onSelect={(id) => {
            setHistoryOpen(false);
            onReset(id);
          }}
          onDeletedCurrent={() => {
            setHistoryOpen(false);
            onReset(null);
          }}
        />
      )}

      <SafetySheet
        conversationId={activeId}
        open={safetyOpen}
        onOpenChange={setSafetyOpen}
      />
    </div>
  );
}

interface GuideChatProps {
  initialQuestion?: string;
  photoPrompt?: boolean;
}

interface GuideLoadedProps extends GuideChatProps {
  storedId: string | null;
}

function GuideLoaded({
  initialQuestion,
  photoPrompt = false,
  storedId,
}: GuideLoadedProps) {
  const t = useTranslations("Guide");
  const [session, setSession] = useState({ key: 0, id: storedId });

  const conversation = useQuery({
    queryKey: ["conversation", session.key, session.id],
    queryFn: () => getConversation(session.id as string),
    enabled: Boolean(session.id),
    gcTime: 0,
    staleTime: Infinity,
    retry: (count, error) =>
      !isNotFound(error) && !isUnauthorized(error) && count < 1,
  });

  const startSession = (id: string | null) => {
    storeConversation(id);
    setSession((current) => ({ key: current.key + 1, id }));
  };

  if (session.id && conversation.isPending) {
    return (
      <div className={SHELL}>
        <header className="flex min-h-14 items-center pt-2 lg:pt-4">
          <h1 className="text-lg font-bold lg:text-xl">{t("title")}</h1>
        </header>
        <ChatSkeleton />
      </div>
    );
  }

  const gone =
    conversation.isError &&
    (isNotFound(conversation.error) || isUnauthorized(conversation.error));

  if (conversation.isError && !gone) {
    return (
      <div className={SHELL}>
        <header className="flex min-h-14 items-center pt-2 lg:pt-4">
          <h1 className="text-lg font-bold lg:text-xl">{t("title")}</h1>
        </header>
        <ErrorState
          title={t("loadError")}
          className="mt-2"
          onRetry={() => conversation.refetch()}
        />
      </div>
    );
  }

  return (
    <ChatSession
      key={session.key}
      conversationId={gone ? null : session.id}
      initialMessages={gone ? [] : (conversation.data?.messages ?? [])}
      initialQuestion={initialQuestion}
      photoPrompt={photoPrompt}
      onConversationChange={storeConversation}
      onReset={startSession}
    />
  );
}

export function GuideChat({ initialQuestion, photoPrompt }: GuideChatProps) {
  const { isReady, isSignedIn } = useAuth();

  if (!isReady) {
    return (
      <div className={SHELL}>
        <ChatSkeleton />
      </div>
    );
  }

  // A question from Home starts a fresh chat; otherwise reopen the last one.
  const storedId =
    isSignedIn && !initialQuestion ? readStoredConversation() : null;

  return (
    <GuideLoaded
      initialQuestion={initialQuestion}
      photoPrompt={photoPrompt}
      storedId={storedId}
    />
  );
}
