import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { rotuloStatus } from "../../lib/status";
import type { StatusPedido } from "../../types";

const cores: Record<StatusPedido, string> = {
  EM_ANALISE_FINANCEIRA: "bg-status-warning-bg text-status-warning-text",
  APROVADO: "bg-status-success-bg text-status-success-text",
  CONTRATO_EM_EXECUCAO: "bg-status-info-bg text-status-info-text",
  CONTRATO_ENCERRADO: "bg-status-completed-bg text-status-completed-text",
  NEGADO: "bg-status-danger-bg text-status-danger-text",
  CANCELADO: "bg-status-inactive-bg text-status-inactive-text",
};

/** Selo de status do pedido. */
export function StatusBadge({ status }: { status: StatusPedido }) {
  return (
    <span className={cn("inline-flex w-fit items-center rounded-pill px-12 py-4 text-caption-bold", cores[status])}>
      {rotuloStatus[status]}
    </span>
  );
}

/** Etiqueta rosa (ex.: "Rendimento 1"). */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center rounded-pill bg-brand-pink-soft px-12 py-4 text-caption-semibold text-brand-primary">
      {children}
    </span>
  );
}
