import type { Banco, Simulacao } from "../types";

/* Mesma conta do SimuladorFinanciamento do back-end (tabela Price), para o resumo mudar na hora em que a pessoa
 * troca as datas ou o parcelamento. Depois de salvo, o pedido traz os valores calculados pelo servidor. */

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

/** "1,49% a.m." */
export const formatJuros = (banco: Banco) =>
  `${banco.jurosMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}% a.m.`;

/** Escolhas de crédito no formulário: id do banco → parcelamento. */
export type EscolhasCredito = Record<number, number>;
