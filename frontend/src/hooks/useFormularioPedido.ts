import { useState } from "react";
import { primeiraDevolucao, primeiraRetirada, diasEntre } from "../lib/format";
import { simular, type EscolhasCredito } from "../lib/financiamento";
import type { EscolhaProposta } from "../services/pedidoService";
import type { Banco, Local, Modelo } from "../types";
import { useBancos, useLocais, useLocaisDoModelo } from "./useCatalogo";

export type ValoresPedido = {
  /** Ids das lojas como texto, como nos selects. */
  localRetiradaId: string;
  localDevolucaoId: string;
  dataRetirada: string;
  dataEntrega: string;
  comCredito: boolean;
  escolhas: EscolhasCredito;
};

export type SimulacaoBanco = { banco: Banco; simulacao: ReturnType<typeof simular> };

/**
 * Estado compartilhado pelos modais de novo pedido e de edição: lojas, período, forma de liquidação e bancos, com
 * o total e as simulações recalculados a cada mudança.
 */
export function useFormularioPedido(modelo: Modelo, inicial: ValoresPedido, retiradaAtual?: Local) {
  const [estado, setValores] = useState(inicial);
  const bancos = useBancos().dados ?? [];
  // Retirada: só lojas com um automóvel deste modelo livre nas datas escolhidas (sem datas, as que têm o modelo).
  const livres = useLocaisDoModelo(modelo.id, { retirada: estado.dataRetirada, entrega: estado.dataEntrega }).dados;
  const lojasRetirada = [...(livres ?? [])];
  // Na edição, o próprio pedido ocupa um carro da loja atual e ela poderia sumir; o servidor confere de novo ao salvar.
  if (retiradaAtual && !lojasRetirada.some((l) => l.id === retiradaAtual.id)) lojasRetirada.push(retiradaAtual);
  // Devolução: qualquer loja da PinkGo.
  const lojasDevolucao = useLocais().dados ?? [];

  // Uma retirada que veio da busca, ou que deixou de ter carro livre ao mudar as datas, fica em branco.
  const retiradaValida =
    !livres || lojasRetirada.some((l) => String(l.id) === estado.localRetiradaId) ? estado.localRetiradaId : "";
  const valores: ValoresPedido = { ...estado, localRetiradaId: retiradaValida };

  const dias = diasEntre(valores.dataRetirada, valores.dataEntrega);
  const total = modelo.diaria * dias;

  const set = (parcial: Partial<ValoresPedido>) => setValores((v) => ({ ...v, ...parcial }));

  /** Trocar a retirada para depois da devolução apaga a devolução, para a pessoa escolher de novo. */
  const setDataRetirada = (dataRetirada: string) =>
    setValores((v) => ({
      ...v,
      dataRetirada,
      dataEntrega: v.dataEntrega && v.dataEntrega < primeiraDevolucao(dataRetirada) ? "" : v.dataEntrega,
    }));

  /** Marcar um banco começa no maior parcelamento que ele oferece. */
  const alternarBanco = (banco: Banco) =>
    setValores((v) => {
      const escolhas = { ...v.escolhas };
      if (banco.id in escolhas) delete escolhas[banco.id];
      else escolhas[banco.id] = Math.max(...banco.opcoesParcelas);
      return { ...v, escolhas };
    });

  const definirParcelas = (bancoId: number, parcelas: number) =>
    setValores((v) => ({ ...v, escolhas: { ...v.escolhas, [bancoId]: parcelas } }));

  /** Simulação de cada banco escolhido, na ordem da lista de bancos. */
  const simulacoes: SimulacaoBanco[] = valores.comCredito
    ? bancos
        .filter((b) => b.id in valores.escolhas)
        .map((banco) => ({ banco, simulacao: simular(total, banco, valores.escolhas[banco.id]) }))
    : [];

  const propostas: EscolhaProposta[] = simulacoes.map(({ banco }) => ({
    bancoId: banco.id,
    parcelas: valores.escolhas[banco.id],
  }));

  /** Mesmas regras do servidor, para avisar antes de enviar. Devolve a primeira mensagem de erro. */
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
