import type { Pagina, Pedido, ResumoPedidos, StatusPedido } from "../types";
import { http, query } from "./http";

export type EscolhaProposta = { bancoId: number; parcelas: number };

export type NovoPedido = {
  modeloId: number;
  localRetiradaId?: number | null;
  localDevolucaoId?: number | null;
  dataRetirada: string;
  dataEntrega: string;
  comCredito: boolean;
  propostas: EscolhaProposta[];
};

export type EdicaoPedido = {
  localRetiradaId: number;
  localDevolucaoId: number;
  dataRetirada: string;
  dataEntrega: string;
  comCredito: boolean;
  propostas: EscolhaProposta[];
};

export type FiltroPedidos = { status?: StatusPedido[]; pagina: number; tamanho: number };

export const pedidoService = {
  listar: ({ status, pagina, tamanho }: FiltroPedidos) =>
    http.get<Pagina<Pedido>>(`/pedidos${query({ status, pagina, tamanho })}`),
  resumo: () => http.get<ResumoPedidos>("/pedidos/resumo"),
  criar: (dados: NovoPedido) => http.post<Pedido>("/pedidos", dados),
  editar: (id: number, dados: EdicaoPedido) => http.put<Pedido>(`/pedidos/${id}`, dados),
  cancelar: (id: number) => http.post<Pedido>(`/pedidos/${id}/cancelamento`),
  escolherFinanciamento: (id: number, bancoId: number) =>
    http.post<Pedido>(`/pedidos/${id}/financiamento`, { bancoId }),
  desistirDoFinanciamento: (id: number) => http.post<Pedido>(`/pedidos/${id}/financiamento/desistencia`),
};
