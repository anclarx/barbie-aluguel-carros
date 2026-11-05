import { catalogoService, type Periodo } from "../services/catalogoService";
import { useAsync } from "./useAsync";

/** Modelos da loja (`localId` nulo traz todos); com o período, só os que têm automóvel livre nesses dias. */
export const useModelos = (localId?: number | null, periodo: Periodo = {}) =>
  useAsync(
    () => catalogoService.modelos(localId, periodo),
    `modelos:${localId ?? "todos"}:${periodo.retirada ?? ""}:${periodo.entrega ?? ""}`,
  );

/** Todas as lojas da PinkGo: busca da Início e devolução, que pode ser em qualquer uma. */
export const useLocais = () => useAsync(catalogoService.locais, "locais");

/** Lojas de retirada do modelo; com o período, só as que têm um automóvel dele livre nesses dias. */
export const useLocaisDoModelo = (modeloId: number, periodo: Periodo = {}) =>
  useAsync(
    () => catalogoService.locaisDoModelo(modeloId, periodo),
    `locais-modelo:${modeloId}:${periodo.retirada ?? ""}:${periodo.entrega ?? ""}`,
  );

export const useBancos = () => useAsync(catalogoService.bancos, "bancos");

export const useTiposRendimento = () => useAsync(catalogoService.tiposRendimento, "tipos-rendimento");
