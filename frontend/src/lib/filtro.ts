import type { Modelo } from "../types";

export type FiltroState = {
  marcas: string[];
  cambios: string[];
  combustiveis: string[];
  assentos: number[];
  anoMinimo: string;
  precoMin: string;
  precoMax: string;
};

export const filtroVazio: FiltroState = {
  marcas: [],
  cambios: [],
  combustiveis: [],
  assentos: [],
  anoMinimo: "",
  precoMin: "",
  precoMax: "",
};

/** Lista vazia = sem restrição naquele grupo. */
export function aplicarFiltro(modelos: Modelo[], f: FiltroState) {
  return modelos.filter(
    (m) =>
      (!f.marcas.length || f.marcas.includes(m.marca)) &&
      (!f.cambios.length || f.cambios.some((c) => m.cambio.toLowerCase().includes(c.toLowerCase()))) &&
      (!f.combustiveis.length || f.combustiveis.some((c) => m.combustivel.startsWith(c))) &&
      (!f.assentos.length || f.assentos.includes(m.assentos)) &&
      (!f.anoMinimo || m.ano >= Number(f.anoMinimo)) &&
      (!f.precoMin || m.diaria >= Number(f.precoMin)) &&
      (!f.precoMax || m.diaria <= Number(f.precoMax)),
  );
}
