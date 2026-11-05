import type { IconName } from "../components/ui/Icon";
import type { ResumoPedidos, StatusPedido } from "../types";

export type Situacao = "todos" | "analise" | "aprovados" | "execucao" | "historico";

type DefinicaoSituacao = { id: Situacao; titulo: string; icon: IconName; status?: StatusPedido[] };

export const SITUACOES: DefinicaoSituacao[] = [
  { id: "todos", titulo: "Todos", icon: "colecao" },
  { id: "analise", titulo: "Em análise", icon: "arquivos", status: ["EM_ANALISE_FINANCEIRA"] },
  { id: "aprovados", titulo: "Aprovados", icon: "seloVerificado", status: ["APROVADO"] },
  { id: "execucao", titulo: "Em execução", icon: "chave", status: ["CONTRATO_EM_EXECUCAO"] },
  { id: "historico", titulo: "Histórico", icon: "calendario", status: ["CONTRATO_ENCERRADO", "CANCELADO", "NEGADO"] },
];

export const statusDaSituacao = (id: Situacao) => SITUACOES.find((s) => s.id === id)?.status;

export function totalDaSituacao(resumo: ResumoPedidos | undefined, id: Situacao) {
  if (!resumo) return 0;
  const status = statusDaSituacao(id);
  return status ? status.reduce((soma, s) => soma + resumo.porStatus[s], 0) : resumo.total;
}
