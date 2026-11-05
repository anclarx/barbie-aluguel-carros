import type { MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useModalAberto } from "../../hooks/useModalAberto";
import { CabecalhoModal } from "./CabecalhoModal";

type Props = {
  open: boolean;
  onClose: () => void;
  contexto?: ReactNode;
  selo?: ReactNode;
  title: string;
  aside: ReactNode;
  children: ReactNode;
};

export function ModalDuasColunas({ open, onClose, contexto, selo, title, aside, children }: Props) {
  useModalAberto(open, onClose);
  if (!open) return null;

  const fecharSeFora = (e: MouseEvent) => e.target === e.currentTarget && onClose();

  return createPortal(
    <div className="scrollbar-oculta fixed inset-0 z-50 overflow-y-auto bg-backdrop" onMouseDown={fecharSeFora}>
      <div className="flex min-h-full items-start justify-center px-16 py-32" onMouseDown={fecharSeFora}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="w-full max-w-modal-lg rounded-lg border border-neutral-border bg-neutral-white"
        >
          <CabecalhoModal
            title={title}
            contexto={contexto}
            selo={selo}
            onClose={onClose}
            className="sticky top-0 z-10 rounded-t-lg bg-neutral-white"
          />
          <div className="grid grid-cols-2 items-start gap-24 p-16 pb-32">
            <div className="flex min-w-0 flex-col gap-24">{children}</div>
            <aside className="scrollbar-oculta sticky top-76 flex max-h-[calc(100vh-108px)] min-w-0 flex-col gap-16 overflow-y-auto">
              {aside}
            </aside>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
