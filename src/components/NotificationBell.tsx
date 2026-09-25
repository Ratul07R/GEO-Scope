"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  type NotificationRecord,
} from "@/lib/db";
import { supabase } from "@/lib/supabase";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}


function formatRelativeTime(dateString: string): string {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  );

  if (elapsedSeconds < 60) return "Just now";
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw new Error(authError.message);
      if (!user) {
        setNotifications([]);
        return;
      }

      setNotifications(await getNotifications(supabase, user.id));
    } catch (fetchError) {
      setError(
        getErrorMessage(fetchError, "Failed to load notifications")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  function togglePanel() {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);
    if (nextIsOpen) void fetchNotifications();
  }

  async function handleNotificationClick(notification: NotificationRecord) {
    if (notification.read) return;

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item
      )
    );

    try {
      await markNotificationAsRead(supabase, notification.id);
    } catch (markError) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: false } : item
        )
      );
      setError(
        getErrorMessage(markError, "Failed to mark notification as read")
      );
    }
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={togglePanel}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[var(--color-bg-base)] bg-[var(--color-danger)] px-0.5 text-[9px] font-semibold leading-none text-[var(--color-text-primary)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-2xl shadow-[var(--color-bg-base)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-3">
            <h2 className="text-[13px] font-medium text-[var(--color-text-primary)]">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="text-[11px] text-[var(--color-text-tertiary)]">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-[12px] text-[var(--color-text-tertiary)]">
                <Loader2 size={14} className="animate-spin" />
                Loading notifications
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-8 text-center">
                <CheckCheck size={20} className="text-[var(--color-text-tertiary)]" />
                <p className="mt-2 text-[12px] text-[var(--color-text-secondary)]">
                  You&apos;re all caught up
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void handleNotificationClick(notification)}
                  className={`block w-full border-b border-[var(--color-border-subtle)] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[var(--color-bg-elevated)] ${
                    notification.read
                      ? "bg-transparent"
                      : "bg-[var(--color-accent-muted)]"
                  }`}
                >
                  <span className="flex items-start gap-2">
                    {!notification.read && (
                      <span
                        aria-label="Unread"
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-[12px] font-medium text-[var(--color-text-primary)]">
                          {notification.title}
                        </span>
                        <time className="shrink-0 text-[10px] text-[var(--color-text-tertiary)]">
                          {formatRelativeTime(notification.created_at)}
                        </time>
                      </span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                        {notification.message}
                      </span>
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="border-t border-[var(--color-border-subtle)] px-4 py-2 text-[11px] text-[var(--color-danger)]"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

