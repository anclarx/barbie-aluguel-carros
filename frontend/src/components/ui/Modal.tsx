import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";
import { Icon } from "./Icon";

type Largura = "sm" | "md" | "lg";

const larguras: Record<Largura, string> = {
  sm: "max-w-modal-sm",
  md: "max-w-modal-md",
  lg: "max-w-modal-lg",
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Linha pequena acima do título (ex.: "Novo pedido · Etapa 1 de 2"). */
  context?: string;
  title: string;
  width?: Largura;
  footer?: ReactNode;
  children: ReactNode;
};

export function Modal({ open, onClose, context, title, width = "lg", footer, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop p-16 backdrop-blur-[6px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "flex max-h-[calc(100vh-32px)] w-full flex-col rounded-lg border border-neutral-border bg-neutral-white",
          larguras[width],
        )}
      >
        <header className="flex h-60 shrink-0 items-center justify-between border-b border-neutral-border px-16">
          <div className="flex flex-col">
            {context && <span className="text-caption-medium text-neutral-secondary">{context}</span>}
            <h2 className="text-body-bold">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-brand-primary">
            <Icon name="fechar" size={24} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-16">{children}</div>
        {footer && (
          <footer className="flex h-63 shrink-0 items-center justify-end gap-12 border-t border-neutral-border px-16">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
