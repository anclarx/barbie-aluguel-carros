import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useToast } from "../hooks/useToast";
import { authService } from "../services/authService";
import { definirAoExpirarSessao } from "../services/http";
import { atualizarClienteDaSessao, lerSessao, limparSessao, salvarSessao, type Sessao } from "../services/sessao";
import { AuthContext, type AuthState } from "./authContext";

/** Sessão (US02): o token fica no armazenamento do navegador e quem está logado, aqui no estado. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(lerSessao);
  const toast = useToast();

  const sair = useCallback(() => {
    limparSessao();
    setSessao(null);
  }, []);

  // Token vencido (ou de uma conta que não existe mais) numa chamada autenticada encerra a sessão.
  useEffect(() => {
    definirAoExpirarSessao(() => {
      sair();
      toast.info("Sua sessão expirou", "Entre de novo para continuar.", "cadeado");
    });
    return () => definirAoExpirarSessao(null);
  }, [sair, toast]);

  const value = useMemo<AuthState>(
    () => ({
      cliente: sessao?.cliente ?? null,
      agente: sessao?.agente ?? null,
      papel: sessao?.papel ?? null,
      sair,
      entrar: async (email, senha, manter) => {
        const nova = await authService.login(email, senha);
        salvarSessao(nova, manter);
        setSessao(nova);
        return nova.papel;
      },
      atualizarCliente: (atualizado) => {
        atualizarClienteDaSessao(atualizado);
        setSessao((s) => (s ? { ...s, cliente: atualizado } : s));
      },
    }),
    [sessao, sair],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
