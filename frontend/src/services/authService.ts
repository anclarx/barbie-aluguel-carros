import type { Agente, Cliente, Papel } from "../types";
import { http } from "./http";

export type RespostaLogin = { token: string; expiraEm: string; papel: Papel; cliente: Cliente | null; agente: Agente | null };

export const authService = {
  login: (email: string, senha: string) => http.post<RespostaLogin>("/auth/login", { email, senha }),
  esqueciSenha: (email: string) => http.post<void>("/auth/esqueci-senha", { email }),
  redefinirSenha: (token: string, novaSenha: string) => http.post<void>("/auth/redefinir-senha", { token, novaSenha }),
};
