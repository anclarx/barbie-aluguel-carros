import { createContext } from "react";
import type { Agente, Cliente, Papel } from "../types";

export type AuthState = {
  cliente: Cliente | null;
  agente: Agente | null;
  papel: Papel | null;
  entrar: (email: string, senha: string, manter: boolean) => Promise<Papel>;
  sair: () => void;
  atualizarCliente: (cliente: Cliente) => void;
};

export const AuthContext = createContext<AuthState | null>(null);
