import type { Pedido, Proposta } from "../types";

export type EtapaCredito = "sem-credito" | "bancos-analisando" | "escolher-banco" | "nenhum-aprovou" | "banco-escolhido";

export function etapaCredito(pedido: Pedido): EtapaCredito {
  if (!pedido.comCredito) return "sem-credito";
  if (pedido.propostas.some((p) => p.status === "EM_ANALISE")) return "bancos-analisando";
  if (pedido.propostas.some((p) => p.escolhida)) return "banco-escolhido";
  return pedido.propostas.some((p) => p.status === "APROVADA") ? "escolher-banco" : "nenhum-aprovou";
}

export const propostaEscolhida = (pedido: Pedido): Proposta | undefined => pedido.propostas.find((p) => p.escolhida);

export const aguardandoBancos = (pedidos: Pedido[]) =>
  pedidos.some((p) => p.status === "EM_ANALISE_FINANCEIRA" && etapaCredito(p) === "bancos-analisando");
