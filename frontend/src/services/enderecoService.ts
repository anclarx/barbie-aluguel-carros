import type { EnderecoSugestao } from "../types";
import { http, query } from "./http";

export const enderecoService = {
  buscar: (busca: string) => http.get<EnderecoSugestao[]>(`/enderecos${query({ busca })}`),
};
