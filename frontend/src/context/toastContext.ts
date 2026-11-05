import { createContext } from "react";
import type { IconName } from "../components/ui/Icon";

export type TipoToast = "sucesso" | "erro" | "info";

export type DadosToast = {
  id: number;
  tipo: TipoToast;
  titulo: string;
  descricao?: string;
  /** Troca o ícone padrão do tipo (check, fechar, selo). */
  icone?: IconName;
  /** Marcado ao fechar, para a animação de saída rodar antes de remover. */
  saindo?: boolean;
};

type Mostrar = (titulo: string, descricao?: string, icone?: IconName) => void;

export type ToastState = {
  sucesso: Mostrar;
  erro: Mostrar;
  info: Mostrar;
  /**
   * Um aviso de erro para cada mensagem que o formulário mostra embaixo dos campos, empilhados na ordem dos campos.
   * O título de cada aviso é o rótulo do campo em `rotulos`, ou `titulo` quando o campo não está lá. Valores
   * `undefined` são ignorados.
   */
  camposInvalidos: (
    erros: Record<string, string | undefined>,
    titulo?: string,
    rotulos?: Record<string, string>,
  ) => void;
};

export const ToastContext = createContext<ToastState | null>(null);
