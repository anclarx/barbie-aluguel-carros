import type { Banco, Local, Modelo, TipoRendimentoOpcao } from "../types";
import { http, query } from "./http";

/** Dias do aluguel (yyyy-mm-dd). Sem eles, a API não olha disponibilidade por data. */
export type Periodo = { retirada?: string; entrega?: string };

export const catalogoService = {
  /** Modelos na loja de retirada; com o período, só os que têm automóvel livre nesses dias. */
  modelos: (localId?: number | null, periodo?: Periodo) =>
    http.get<Modelo[]>(`/modelos${query({ localId, ...periodo })}`),
  /** Lojas da PinkGo (lista fixa) onde o carro é retirado e devolvido. */
  locais: () => http.get<Local[]>("/locais"),
  /** Opções de retirada no pedido: lojas com o modelo e, com o período, só as que têm um automóvel dele livre. */
  locaisDoModelo: (modeloId: number, periodo?: Periodo) =>
    http.get<Local[]>(`/modelos/${modeloId}/locais${query({ ...periodo })}`),
  /** Bancos parceiros que financiam o aluguel. */
  bancos: () => http.get<Banco[]>("/bancos"),
  tiposRendimento: () => http.get<TipoRendimentoOpcao[]>("/tipos-rendimento"),
};
