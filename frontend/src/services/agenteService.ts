import type { Pagina, PedidoAgente, ResumoPedidos, TipoContrato } from "../types";
import { http, query } from "./http";
import type { FiltroPedidos } from "./pedidoService";

/** Parecer do agente sobre o pedido, ou o passo seguinte do contrato. */
export type AcaoAgente = "aprovacao" | "negacao" | "inicio-contrato" | "encerramento";

/** Justificativa do parecer e, na aprovação, em nome de quem o automóvel fica durante o contrato. */
export type Parecer = { justificativa?: string; tipoContrato?: TipoContrato };

/** Painel do agente da PinkGo. Os bancos não têm agente: respondem sozinhos às propostas de crédito. */
export const agenteService = {
  pedidos: ({ status, pagina, tamanho }: FiltroPedidos) =>
    http.get<Pagina<PedidoAgente>>(`/agentes/pedidos${query({ status, pagina, tamanho })}`),
  resumo: () => http.get<ResumoPedidos>("/agentes/pedidos/resumo"),
  /** O parecer vale para aprovação e negação e fica guardado no pedido; o tipo de contrato, só na aprovação. */
  agir: (pedidoId: number, acao: AcaoAgente, { justificativa, tipoContrato }: Parecer = {}) =>
    http.post<PedidoAgente>(`/agentes/pedidos/${pedidoId}/${acao}`, {
      justificativa: justificativa?.trim() || null,
      tipoContrato: acao === "aprovacao" ? (tipoContrato ?? null) : null,
    }),
};
