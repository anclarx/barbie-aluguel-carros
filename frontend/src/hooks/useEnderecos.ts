import { enderecoService } from "../services/enderecoService";
import { useAsync } from "./useAsync";

export const useEnderecos = (busca: string) =>
  useAsync(() => (busca.length < 3 ? Promise.resolve([]) : enderecoService.buscar(busca)), `enderecos:${busca}`);
