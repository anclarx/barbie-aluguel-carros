import { useState } from "react";
import { primeiraDevolucao, primeiraRetirada, diasEntre } from "../lib/format";
import { simular, type EscolhasCredito } from "../lib/financiamento";
import type { EscolhaProposta } from "../services/pedidoService";
import type { Banco, Local, Modelo } from "../types";
import { useBancos, useLocais, useLocaisDoModelo } from "./useCatalogo";

export type ValoresPedido = {
  localRetiradaId: string;
  localDevolucaoId: string;
  dataRetirada: string;
  dataEntrega: string;
  comCredito: boolean;
  escolhas: EscolhasCredito;
};

export type SimulacaoBanco = { banco: Banco; simulacao: ReturnType<typeof simular> };

export function useFormularioPedido(modelo: Modelo, inicial: ValoresPedido, retiradaAtual?: Local) {
  const [estado, setValores] = useState(inicial);
  const bancos = useBancos().dados ?? [];
  const livres = useLocaisDoModelo(modelo.id, { retirada: estado.dataRetirada, entrega: estado.dataEntrega }).dados;
  const lojasRetirada = [...(livres ?? [])];
  if (retiradaAtual && !lojasRetirada.some((l) => l.id === retiradaAtual.id)) lojasRetirada.push(retiradaAtual);
  const lojasDevolucao = useLocais().dados ?? [];

  const retiradaValida =
    !livres || lojasRetirada.some((l) => String(l.id) === estado.localRetiradaId) ? estado.localRetiradaId : "";
  const valores: ValoresPedido = { ...estado, localRetiradaId: retiradaValida };

  const dias = diasEntre(valores.dataRetirada, valores.dataEntrega);
  const total = modelo.diaria * dias;

  const set = (parcial: Partial<ValoresPedido>) => setValores((v) => ({ ...v, ...parcial }));

  const setDataRetirada = (dataRetirada: string) =>
    setValores((v) => ({
      ...v,
      dataRetirada,
      dataEntrega: v.dataEntrega && v.dataEntrega < primeiraDevolucao(dataRetirada) ? "" : v.dataEntrega,
    }));

  const alternarBanco = (banco: Banco) =>
    setValores((v) => {
      const escolhas = { ...v.escolhas };
      if (banco.id in escolhas) delete escolhas[banco.id];
      else escolhas[banco.id] = Math.max(...banco.opcoesParcelas);
      return { ...v, escolhas };
    });

  const definirParcelas = (bancoId: number, parcelas: number) =>
    setValores((v) => ({ ...v, escolhas: { ...v.escolhas, [bancoId]: parcelas } }));

  const simulacoes: SimulacaoBanco[] = valores.comCredito
    ? bancos
        .filter((b) => b.id in valores.escolhas)
        .map((banco) => ({ banco, simulacao: simular(total, banco, valores.escolhas[banco.id]) }))
    : [];

  const propostas: EscolhaProposta[] = simulacoes.map(({ banco }) => ({
    bancoId: banco.id,
    parcelas: valores.escolhas[banco.id],
  }));

  const validar = (): string | null => {
    if (!valores.localRetiradaId || !valores.localDevolucaoId) return "Escolha as lojas de retirada e devolução.";
    if (!valores.dataRetirada || !valores.dataEntrega) return "Informe as datas de retirada e devolução.";
    if (valores.dataRetirada < primeiraRetirada()) return "A retirada precisa ser a partir de amanhã.";
    if (valores.dataEntrega < primeiraDevolucao(valores.dataRetirada))
      return "A devolução precisa ser pelo menos 1 dia depois da retirada.";
    if (valores.comCredito && !propostas.length) return "Escolha pelo menos um banco para o crédito.";
    return null;
  };

  return {
    valores,
    set,
    setDataRetirada,
    alternarBanco,
    definirParcelas,
    bancos,
    lojasRetirada,
    lojasDevolucao,
    dias,
    total,
    simulacoes,
    propostas,
    validar,
  };
}

export type FormularioPedido = ReturnType<typeof useFormularioPedido>;
