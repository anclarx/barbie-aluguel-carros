import { createContext } from "react";
import type { IconName } from "../components/ui/Icon";

export type TipoToast = "sucesso" | "erro" | "info";

export type DadosToast = {
  id: number;
  tipo: TipoToast;
  titulo: string;
  descricao?: string;
  icone?: IconName;
  saindo?: boolean;
};

type Mostrar = (titulo: string, descricao?: string, icone?: IconName) => void;

export type ToastState = {
  sucesso: Mostrar;
  erro: Mostrar;
  info: Mostrar;
  camposInvalidos: (
    erros: Record<string, string | undefined>,
    titulo?: string,
    rotulos?: Record<string, string>,
  ) => void;
};

export const ToastContext = createContext<ToastState | null>(null);
