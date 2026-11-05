import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Icon } from "./Icon";

type Props = {
  title: string;
  /** Linha pequena acima do título (ex.: "Pedido #P12"). */
  contexto?: ReactNode;
  /** Selo à esquerda do título, como o status nos modais de pedido (Figma "Modal editar/cancelar pedido"). */
  selo?: ReactNode;
  onClose: () => void;
  className?: string;
};

/** Cabeçalho dos modais: selo opcional, contexto, título e o X de fechar. */
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
