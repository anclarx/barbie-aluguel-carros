import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Icon } from "./Icon";

type Props = {
  title: string;
  contexto?: ReactNode;
  selo?: ReactNode;
  onClose: () => void;
  className?: string;
};

export function CabecalhoModal({ title, contexto, selo, onClose, className }: Props) {
  return (
    <header
      className={cn("flex h-60 shrink-0 items-center justify-between gap-16 border-b border-neutral-border px-16", className)}
    >
      <div className="flex min-w-0 items-center gap-12">
        {selo}
        <div className="flex min-w-0 flex-col">
          {contexto && <span className="text-caption-medium text-neutral-secondary">{contexto}</span>}
          <h2 className="text-body-bold">{title}</h2>
        </div>
      </div>
      <button type="button" onClick={onClose} aria-label="Fechar" className="shrink-0 text-brand-primary">
        <Icon name="fechar" size={24} />
      </button>
    </header>
  );
}
