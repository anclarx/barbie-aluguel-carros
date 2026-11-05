import { formatBRL, formatData, diasEntre } from "../../lib/format";
import { Stepper, type Etapa } from "../ui/Stepper";
import type { Modelo, StatusPedido } from "../../types";

type ResumoProps = {
  modelo?: Modelo;
  diaria: number;
  dataRetirada: string;
  dataEntrega: string;
  comCredito: boolean;
};

export function ResumoPedido({ modelo, diaria, dataRetirada, dataEntrega, comCredito }: ResumoProps) {
  const dias = diasEntre(dataRetirada, dataEntrega);
  const linhas: Array<[string, string]> = [
    ...(modelo ? ([["Automóvel", modelo.nome]] as Array<[string, string]>) : []),
    ["Período", dataRetirada && dataEntrega ? `${formatData(dataRetirada)} → ${formatData(dataEntrega)}` : "—"],
    ["Duração", `${dias} ${dias === 1 ? "dia" : "dias"}`],
    ["Diária", formatBRL(diaria)],
    ["Liquidação", comCredito ? "Com crédito bancário" : "Sem crédito bancário"],
  ];
  return (
    <div className="flex flex-col gap-16 rounded-lg border border-neutral-border p-16">
      <dl className="flex flex-col gap-4">
        {linhas.map(([rotulo, valor]) => (
          <div key={rotulo} className="flex justify-between gap-16 text-body-medium">
            <dt className="text-neutral-secondary">{rotulo}</dt>
            <dd className="text-right">{valor}</dd>
          </div>
        ))}
      </dl>
      <div className="flex justify-between border-t border-neutral-border pt-16 text-body-medium">
        <span className="text-neutral-secondary">Total estimado</span>
        <span className="text-body-bold">{formatBRL(diaria * dias)}</span>
      </div>
    </div>
  );
}

const etapas: Etapa[] = [
  { label: "Pedido enviado", icon: "check" },
  { label: "Análise financeira", icon: "arquivos" },
  { label: "Aprovação", icon: "seloVerificado" },
  { label: "Contrato em execução", icon: "chave" },
];

const etapaAtual: Record<StatusPedido, number> = {
  EM_ANALISE_FINANCEIRA: 1,
  NEGADO: 1,
  CANCELADO: 1,
  APROVADO: 2,
  CONTRATO_EM_EXECUCAO: 3,
  CONTRATO_ENCERRADO: 4,
};

export function AndamentoPedido({ status }: { status: StatusPedido }) {
  return <Stepper etapas={etapas} atual={etapaAtual[status]} />;
}
