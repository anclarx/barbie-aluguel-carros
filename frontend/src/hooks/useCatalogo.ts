import { catalogoService, type Periodo } from "../services/catalogoService";
import { useAsync } from "./useAsync";

export const useModelos = (localId?: number | null, periodo: Periodo = {}) =>
  useAsync(
    () => catalogoService.modelos(localId, periodo),
    `modelos:${localId ?? "todos"}:${periodo.retirada ?? ""}:${periodo.entrega ?? ""}`,
  );

export const useLocais = () => useAsync(catalogoService.locais, "locais");

export const useLocaisDoModelo = (modeloId: number, periodo: Periodo = {}) =>
  useAsync(
    () => catalogoService.locaisDoModelo(modeloId, periodo),
    `locais-modelo:${modeloId}:${periodo.retirada ?? ""}:${periodo.entrega ?? ""}`,
  );

export const useBancos = () => useAsync(catalogoService.bancos, "bancos");

export const useTiposRendimento = () => useAsync(catalogoService.tiposRendimento, "tipos-rendimento");
