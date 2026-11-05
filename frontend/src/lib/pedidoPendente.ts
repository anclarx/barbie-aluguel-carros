import type { ValoresPedido } from "../hooks/useFormularioPedido";
import type { Modelo } from "../types";
import { CHAVES_SESSAO } from "./chavesSessao";

/** Modelo e escolhas do modal de novo pedido de quem clicou em "Alugar" sem estar logado. */
export type PedidoPendente = { modelo: Modelo; valores: ValoresPedido };

/* O armazenamento pode estar bloqueado (aba privada, por exemplo): aí o pedido só não é lembrado. */

export function guardarPedidoPendente(pendente: PedidoPendente) {
  try {
    sessionStorage.setItem(CHAVES_SESSAO.pedidoPendente, JSON.stringify(pendente));
  } catch {
    /* sem armazenamento, segue sem lembrar */
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
    /* nada a apagar */
  }
}
