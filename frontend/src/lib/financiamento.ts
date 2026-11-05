import type { Banco, Simulacao } from "../types";

const centavos = (valor: number) => Math.round(valor * 100) / 100;

export function simular(totalAluguel: number, banco: Banco, parcelas: number): Simulacao {
  const entrada = centavos((totalAluguel * banco.entradaMinima) / 100);
  const valorFinanciado = centavos(totalAluguel - entrada);
  const i = banco.jurosMensal / 100;
  const fator = Math.pow(1 + i, parcelas);
  const valorParcela = centavos(i === 0 ? valorFinanciado / parcelas : (valorFinanciado * i * fator) / (fator - 1));
  const totalParcelas = centavos(valorParcela * parcelas);
  return {
    entrada,
    valorFinanciado,
    parcelas,
    valorParcela,
    totalJuros: centavos(totalParcelas - valorFinanciado),
    totalComFinanciamento: centavos(entrada + totalParcelas),
  };
}

export const formatJuros = (banco: Banco) =>
  `${banco.jurosMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}% a.m.`;

export type EscolhasCredito = Record<number, number>;
