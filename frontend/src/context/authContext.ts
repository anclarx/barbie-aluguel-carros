import { createContext } from "react";
import type { Agente, Cliente, Papel } from "../types";

export type AuthState = {
  /** Cliente logado, ou null para visitante e para agente. */
  cliente: Cliente | null;
  /** Agente logado (empresa ou banco), ou null. */
  agente: Agente | null;
  papel: Papel | null;
  /** Devolve o papel de quem entrou, para a tela de login saber para onde ir. */
  entrar: (email: string, senha: string, manter: boolean) => Promise<Papel>;
  sair: () => void;
  /** Troca o cliente da sessão depois de editar o perfil. */
  atualizarCliente: (cliente: Cliente) => void;
};

export const AuthContext = createContext<AuthState | null>(null);
