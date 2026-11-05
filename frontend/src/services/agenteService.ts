import type { Pagina, PedidoAgente, ResumoPedidos, TipoContrato } from "../types";
import { http, query } from "./http";
import type { FiltroPedidos } from "./pedidoService";

export type AcaoAgente = "aprovacao" | "negacao" | "inicio-contrato" | "encerramento";

export type Parecer = { justificativa?: string; tipoContrato?: TipoContrato };

export const agenteService = {
  pedidos: ({ status, pagina, tamanho }: FiltroPedidos) =>
    http.get<Pagina<PedidoAgente>>(`/agentes/pedidos${query({ status, pagina, tamanho })}`),
  resumo: () => http.get<ResumoPedidos>("/agentes/pedidos/resumo"),
  agir: (pedidoId: number, acao: AcaoAgente, { justificativa, tipoContrato }: Parecer = {}) =>
    http.post<PedidoAgente>(`/agentes/pedidos/${pedidoId}/${acao}`, {
      justificativa: justificativa?.trim() || null,
      tipoContrato: acao === "aprovacao" ? (tipoContrato ?? null) : null,
    }),
};
