import type { Banco, Local, Modelo, TipoRendimentoOpcao } from "../types";
import { http, query } from "./http";

export type Periodo = { retirada?: string; entrega?: string };

export const catalogoService = {
  modelos: (localId?: number | null, periodo?: Periodo) =>
    http.get<Modelo[]>(`/modelos${query({ localId, ...periodo })}`),
  locais: () => http.get<Local[]>("/locais"),
  locaisDoModelo: (modeloId: number, periodo?: Periodo) =>
    http.get<Local[]>(`/modelos/${modeloId}/locais${query({ ...periodo })}`),
  bancos: () => http.get<Banco[]>("/bancos"),
  tiposRendimento: () => http.get<TipoRendimentoOpcao[]>("/tipos-rendimento"),
};
