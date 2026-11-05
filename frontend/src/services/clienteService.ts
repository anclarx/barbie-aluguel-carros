import type { Cliente, Rendimento } from "../types";
import { http } from "./http";

type DadosCliente = Omit<Cliente, "id" | "rendimentos"> & { rendimentos: Rendimento[] };

export type Cadastro = DadosCliente & { senha: string };
export type AtualizacaoCliente = DadosCliente & { senhaAtual?: string; novaSenha?: string };

const paraApi = (rendimentos: Rendimento[]) =>
  rendimentos.map(({ tipo, entidadeEmpregadora, valorMensal }) => ({
    tipo: tipo || null,
    entidadeEmpregadora: entidadeEmpregadora || null,
    valorMensal,
  }));

export const clienteService = {
  cadastrar: (dados: Cadastro) => http.post<Cliente>("/clientes", { ...dados, rendimentos: paraApi(dados.rendimentos) }),
  perfil: () => http.get<Cliente>("/clientes/me"),
  atualizar: (dados: AtualizacaoCliente) =>
    http.put<Cliente>("/clientes/me", { ...dados, rendimentos: paraApi(dados.rendimentos) }),
  excluir: () => http.delete("/clientes/me"),
  verificar: (dados: Partial<Record<"email" | "cpf" | "rg", string>>) => http.post<void>("/clientes/verificacao", dados),
};
