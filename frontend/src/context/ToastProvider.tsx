import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { PilhaToasts } from "../components/ui/Toast";
import { ToastContext, type DadosToast, type TipoToast, type ToastState } from "./toastContext";

const MAXIMO = 5;
const SAIDA_MS = 200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<DadosToast[]>([]);
  const proximoId = useRef(0);

  const fechar = useCallback((id: number) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, saindo: true } : t)));
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), SAIDA_MS);
  }, []);

  const value = useMemo<ToastState>(() => {
    const mostrar =
      (tipo: TipoToast): ToastState["sucesso"] =>
      (titulo, descricao, icone) => {
        const id = ++proximoId.current;
        setToasts((ts) => [...ts, { id, tipo, titulo, descricao, icone }].slice(-MAXIMO));
      };
    const erro = mostrar("erro");
    return {
      sucesso: mostrar("sucesso"),
      erro,
      info: mostrar("info"),
      camposInvalidos: (erros, titulo = "Confira os campos destacados", rotulos) => {
        const comErro = Object.entries(erros).filter((par): par is [string, string] => !!par[1]);
        for (const [campo, mensagem] of comErro.reverse()) erro(rotulos?.[campo] ?? titulo, mensagem);
      },
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <PilhaToasts toasts={toasts} onFechar={fechar} />
    </ToastContext.Provider>
  );
}
