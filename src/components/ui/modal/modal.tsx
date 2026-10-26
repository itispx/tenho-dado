"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";

import useBodyScrollLock from "@/hooks/use-body-scroll-lock";

type ModalTone = "neutral" | "danger";
type ModalWidth = "sm" | "lg";

export interface ModalProps {
  labelledBy: string;
  describedBy?: string;
  onClose?: () => void;
  isBusy?: boolean;
  tone?: ModalTone;
  width?: ModalWidth;
  className?: string;
  children: React.ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const toneClasses: Record<ModalTone, string> = {
  neutral: "border-ink-700",
  danger: "border-danger/30",
};

const widthClasses: Record<ModalWidth, string> = {
  sm: "sm:max-w-sm",
  lg: "sm:max-w-lg",
};

function Modal({
  labelledBy,
  describedBy,
  onClose,
  isBusy = false,
  tone = "neutral",
  width = "lg",
  className,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useBodyScrollLock();

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const preferred = panel?.querySelector<HTMLElement>("[data-autofocus]");
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);

    (preferred ?? first ?? panel)?.focus();

    return () => previousFocusRef.current?.focus?.();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!isBusy) onClose?.();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;

      if (!panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (item) => item.offsetParent !== null,
      );

      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isBusy, onClose]);

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex animate-fade-in items-end justify-center bg-[var(--bg-overlay)] px-4 pt-6 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={clsx(
          "w-full animate-sheet-in rounded-t-lg border bg-ink-900 p-5 focus:outline-none",
          "max-h-[90dvh] overflow-y-auto pb-[calc(1.25rem+env(safe-area-inset-bottom))]",
          "sm:rounded-lg sm:pb-5",
          widthClasses[width],
          toneClasses[tone],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
