import type { Agente, Cliente, Papel } from "../types";

const CHAVE = "pinkgo.sessao";

export type Sessao = { token: string; expiraEm: string; papel: Papel; cliente: Cliente | null; agente: Agente | null };

const armazenamentos = () => [localStorage, sessionStorage];

export function lerSessao(): Sessao | null {
  for (const storage of armazenamentos()) {
    try {
      const bruto = storage.getItem(CHAVE);
      if (!bruto) continue;
      const sessao = { papel: "CLIENTE", agente: null, ...JSON.parse(bruto) } as Sessao;
      if (new Date(sessao.expiraEm).getTime() > Date.now()) return sessao;
      storage.removeItem(CHAVE);
    } catch {
    }
  }
  return null;
}

export function salvarSessao(sessao: Sessao, manter: boolean) {
  limparSessao();
  try {
    (manter ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(sessao));
  } catch {
  }
}

export function atualizarClienteDaSessao(cliente: Cliente) {
  for (const storage of armazenamentos()) {
    try {
      const bruto = storage.getItem(CHAVE);
      if (bruto) storage.setItem(CHAVE, JSON.stringify({ ...(JSON.parse(bruto) as Sessao), cliente }));
    } catch {
    }
  }
}

export function limparSessao() {
  for (const storage of armazenamentos()) {
    try {
      storage.removeItem(CHAVE);
    } catch {
    }
  }
}

export const tokenAtual = () => lerSessao()?.token ?? null;
