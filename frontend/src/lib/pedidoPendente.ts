import type { ValoresPedido } from "../hooks/useFormularioPedido";
import type { Modelo } from "../types";
import { CHAVES_SESSAO } from "./chavesSessao";

export type PedidoPendente = { modelo: Modelo; valores: ValoresPedido };

export function guardarPedidoPendente(pendente: PedidoPendente) {
  try {
    sessionStorage.setItem(CHAVES_SESSAO.pedidoPendente, JSON.stringify(pendente));
  } catch {
  }
}

export function lerPedidoPendente(): PedidoPendente | null {
  try {
    const salvo = sessionStorage.getItem(CHAVES_SESSAO.pedidoPendente);
    return salvo ? (JSON.parse(salvo) as PedidoPendente) : null;
  } catch {
    return null;
  }
}

export function esquecerPedidoPendente() {
  try {
    sessionStorage.removeItem(CHAVES_SESSAO.pedidoPendente);
  } catch {
  }
}
