import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { rotuloStatus } from "../../lib/status";
import type { StatusPedido, StatusProposta } from "../../types";

const cores: Record<StatusPedido, string> = {
  EM_ANALISE_FINANCEIRA: "bg-status-warning-bg text-status-warning-text",
  APROVADO: "bg-status-success-bg text-status-success-text",
  CONTRATO_EM_EXECUCAO: "bg-status-info-bg text-status-info-text",
  CONTRATO_ENCERRADO: "bg-status-completed-bg text-status-completed-text",
  NEGADO: "bg-status-danger-bg text-status-danger-text",
  CANCELADO: "bg-status-inactive-bg text-status-inactive-text",
};

/** Selo de status do pedido. `md` é o do cabeçalho dos modais de pedido. */
export function StatusBadge({ status, tamanho = "sm" }: { status: StatusPedido; tamanho?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center rounded-pill",
        tamanho === "md" ? "px-16 py-6 text-label-bold" : "px-12 py-4 text-caption-bold",
        cores[status],
      )}
    >
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

/** Situação da análise de crédito em cada banco; NAO_ENVIADO é o banco que ainda não foi escolhido. */
const propostas: Record<StatusProposta | "NAO_ENVIADO", { rotulo: string; cor: string }> = {
  EM_ANALISE: { rotulo: "Em análise", cor: "bg-status-warning-bg text-status-warning-text" },
  APROVADA: { rotulo: "Aprovado", cor: "bg-status-success-bg text-status-success-text" },
  NEGADA: { rotulo: "Negado", cor: "bg-status-danger-bg text-status-danger-text" },
  NAO_ENVIADO: { rotulo: "Não enviado", cor: "bg-status-inactive-bg text-status-inactive-text" },
};

export function PropostaBadge({ status }: { status: StatusProposta | "NAO_ENVIADO" }) {
  const { rotulo, cor } = propostas[status];
  return <span className={cn("inline-flex w-fit items-center rounded-pill px-8 py-2 text-caption-bold", cor)}>{rotulo}</span>;
}
