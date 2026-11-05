import { enderecoService } from "../services/enderecoService";
import { useAsync } from "./useAsync";

/** Busca só a partir de 3 letras; antes disso devolve lista vazia sem chamar a API. */
export const useEnderecos = (busca: string) =>
  useAsync(() => (busca.length < 3 ? Promise.resolve([]) : enderecoService.buscar(busca)), `enderecos:${busca}`);
