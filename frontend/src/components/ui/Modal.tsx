import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useModalAberto } from "../../hooks/useModalAberto";
import { cn } from "../../lib/cn";
import { CabecalhoModal } from "./CabecalhoModal";

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
  /** Selo à esquerda do título (ex.: status do pedido). */
  selo?: ReactNode;
  title: string;
  width?: Largura;
  footer?: ReactNode;
  children: ReactNode;
};

export function Modal({ open, onClose, context, selo, title, width = "lg", footer, children }: ModalProps) {
  useModalAberto(open, onClose);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop p-16"
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
        <CabecalhoModal title={title} contexto={context} selo={selo} onClose={onClose} />
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
