import type { Pedido, Proposta } from "../types";

/**
 * Em que pé está o crédito de um pedido em análise:
 * - `sem-credito`: o aluguel é pago sem financiamento;
 * - `bancos-analisando`: algum banco ainda não respondeu (eles respondem sozinhos em uns 30 segundos);
 * - `escolher-banco`: pelo menos um banco aprovou e o cliente ainda não escolheu;
 * - `nenhum-aprovou`: todos negaram; o cliente precisa seguir sem financiamento (ou cancelar);
 * - `banco-escolhido`: o cliente escolheu; falta só o parecer da PinkGo.
 */
export type EtapaCredito = "sem-credito" | "bancos-analisando" | "escolher-banco" | "nenhum-aprovou" | "banco-escolhido";

export function etapaCredito(pedido: Pedido): EtapaCredito {
  if (!pedido.comCredito) return "sem-credito";
  if (pedido.propostas.some((p) => p.status === "EM_ANALISE")) return "bancos-analisando";
  if (pedido.propostas.some((p) => p.escolhida)) return "banco-escolhido";
  return pedido.propostas.some((p) => p.status === "APROVADA") ? "escolher-banco" : "nenhum-aprovou";
}

export const propostaEscolhida = (pedido: Pedido): Proposta | undefined => pedido.propostas.find((p) => p.escolhida);

/** Algum pedido da lista ainda espera resposta de banco? A tela recarrega sozinha até chegar. */
export const aguardandoBancos = (pedidos: Pedido[]) =>
  pedidos.some((p) => p.status === "EM_ANALISE_FINANCEIRA" && etapaCredito(p) === "bancos-analisando");
