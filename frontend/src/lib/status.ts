import type { StatusPedido } from "../types";

export const rotuloStatus: Record<StatusPedido, string> = {
  EM_ANALISE_FINANCEIRA: "Em análise financeira",
  APROVADO: "Aprovado",
  CONTRATO_EM_EXECUCAO: "Contrato em execução",
  CONTRATO_ENCERRADO: "Contrato encerrado",
  NEGADO: "Negado",
  CANCELADO: "Cancelado",
};
