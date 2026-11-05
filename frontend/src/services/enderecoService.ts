import type { EnderecoSugestao } from "../types";
import { http, query } from "./http";

export const enderecoService = {
  /** Sugestões de endereço residencial (OpenStreetMap, via back-end). Menos de 3 letras devolve lista vazia. */
  buscar: (busca: string) => http.get<EnderecoSugestao[]>(`/enderecos${query({ busca })}`),
};
