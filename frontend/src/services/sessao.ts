import type { Agente, Cliente, Papel } from "../types";

/*
 * Guarda o token e quem está logado (cliente ou agente). "Manter logado" usa o localStorage (sobrevive a fechar o navegador);
 * sem ele, o sessionStorage (só a aba atual).
 */

const CHAVE = "pinkgo.sessao";

export type Sessao = { token: string; expiraEm: string; papel: Papel; cliente: Cliente | null; agente: Agente | null };

const armazenamentos = () => [localStorage, sessionStorage];

export function lerSessao(): Sessao | null {
  for (const storage of armazenamentos()) {
    try {
      const bruto = storage.getItem(CHAVE);
      if (!bruto) continue;
      // Sessões salvas antes dos agentes não têm papel: eram de clientes.
      const sessao = { papel: "CLIENTE", agente: null, ...JSON.parse(bruto) } as Sessao;
      if (new Date(sessao.expiraEm).getTime() > Date.now()) return sessao;
      storage.removeItem(CHAVE);
    } catch {
      /* armazenamento indisponível ou corrompido: segue sem sessão */
    }
  }
  return null;
}

export function salvarSessao(sessao: Sessao, manter: boolean) {
  limparSessao();
  try {
    (manter ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(sessao));
  } catch {
    /* sem armazenamento a sessão vale só enquanto a página estiver aberta */
  }
}

/** Atualiza o cliente salvo (depois de editar o perfil) sem trocar onde a sessão está guardada. */
export function atualizarClienteDaSessao(cliente: Cliente) {
  for (const storage of armazenamentos()) {
    try {
      const bruto = storage.getItem(CHAVE);
      if (bruto) storage.setItem(CHAVE, JSON.stringify({ ...(JSON.parse(bruto) as Sessao), cliente }));
    } catch {
      /* ignora */
    }
  }
}

export function limparSessao() {
  for (const storage of armazenamentos()) {
    try {
      storage.removeItem(CHAVE);
    } catch {
      /* ignora */
    }
  }
}

export const tokenAtual = () => lerSessao()?.token ?? null;
