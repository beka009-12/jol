"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "cn";
import { BottomSheet } from "@/components/bottom-sheet";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteConversation, listConversations } from "@/lib/api/client";
import { formatDate } from "@/lib/format";

interface HistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentId: string | null;
  onSelect: (id: string) => void;
  onDeletedCurrent: () => void;
}

export function HistorySheet({
  open,
  onOpenChange,
  currentId,
  onSelect,
  onDeletedCurrent,
}: HistorySheetProps) {
  const t = useTranslations("Guide");
  const locale = useLocale();
  const queryClient = useQueryClient();

  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: listConversations,
    enabled: open,
  });

  const remove = useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (id === currentId) onDeletedCurrent();
    },
  });

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={t("history")}>
      {conversations.isError ? (
        <ErrorState
          title={t("historyError")}
          onRetry={() => conversations.refetch()}
        />
      ) : conversations.isPending ? (
        <div className="space-y-2" aria-hidden>
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : conversations.data.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">
          {t("historyEmpty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {conversations.data.map((conversation) => (
            <li key={conversation.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelect(conversation.id)}
                aria-current={conversation.id === currentId ? "true" : undefined}
                className={cn(
                  "min-h-14 min-w-0 flex-1 rounded-xl px-4 py-2 text-left transition-colors duration-150 hover:bg-accent",
                  conversation.id === currentId ? "bg-accent" : "bg-secondary",
                )}
              >
                <span className="block truncate font-medium">
                  {conversation.title}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {formatDate(conversation.updated_at, locale)}
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("deleteChat", { title: conversation.title })}
                disabled={remove.isPending}
                onClick={() => remove.mutate(conversation.id)}
              >
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </BottomSheet>
  );
}
