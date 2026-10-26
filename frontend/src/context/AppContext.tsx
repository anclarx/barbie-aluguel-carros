import { createContext, useContext, useState, type ReactNode } from "react";
import { automoveis as automoveisIniciais, clienteExemplo, pedidosIniciais } from "../data/mock";
import { diasEntre } from "../lib/format";
import type { Automovel, Cliente, Modelo, Pedido } from "../types";

/*
 * Estado em memória que simula o backend.
 * Quando a API existir, estas funções passam a chamar os endpoints e as telas não mudam.
 */

export type NovoPedido = { modelo: Modelo; dataRetirada: string; dataEntrega: string; comCredito: boolean };
export type EdicaoPedido = { dataRetirada: string; dataEntrega: string; comCredito: boolean };

type AppState = {
  cliente: Cliente | null;
  entrar: (email: string) => void;
  sair: () => void;
  salvarCliente: (cliente: Cliente) => void;
  pedidos: Pedido[];
  automovelLivre: (modeloId: number) => Automovel | undefined;
  criarPedido: (dados: NovoPedido) => Pedido;
  editarPedido: (id: number, dados: EdicaoPedido) => void;
  cancelarPedido: (id: number) => void;
};

const AppContext = createContext<AppState | null>(null);

const totalEstimado = (diaria: number, retirada: string, entrega: string) => diaria * diasEntre(retirada, entrega);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosIniciais);
  const [automoveis, setAutomoveis] = useState<Automovel[]>(automoveisIniciais);

  const automovelLivre = (modeloId: number) => automoveis.find((a) => a.modeloId === modeloId && a.disponivel);

  const marcarDisponivel = (automovelId: number, disponivel: boolean) =>
    setAutomoveis((lista) => lista.map((a) => (a.id === automovelId ? { ...a, disponivel } : a)));

  const criarPedido = ({ modelo, dataRetirada, dataEntrega, comCredito }: NovoPedido) => {
    const automovel = automovelLivre(modelo.id) ?? null;
    if (automovel) marcarDisponivel(automovel.id, false);
    const id = Math.floor(1000 + Math.random() * 9000);
    const pedido: Pedido = {
      id,
      codigo: `P${id}`,
      modelo,
      automovel: automovel && { ...automovel, disponivel: false },
      dataSolicitacao: new Date().toISOString().slice(0, 10),
      dataRetirada,
      dataEntrega,
      comCredito,
      totalEstimado: totalEstimado(modelo.diaria, dataRetirada, dataEntrega),
      status: "EM_ANALISE_FINANCEIRA",
      tipoContrato: comCredito ? "PROPRIEDADE_BANCO" : "PROPRIEDADE_EMPRESA",
    };
    setPedidos((lista) => [pedido, ...lista]);
    return pedido;
  };

  const editarPedido = (id: number, dados: EdicaoPedido) =>
    setPedidos((lista) =>
      lista.map((p) =>
        p.id === id
          ? {
              ...p,
              ...dados,
              totalEstimado: totalEstimado(p.modelo.diaria, dados.dataRetirada, dados.dataEntrega),
              tipoContrato: dados.comCredito ? "PROPRIEDADE_BANCO" : "PROPRIEDADE_EMPRESA",
              // Pedido aprovado que é modificado volta para análise (US05).
              status: "EM_ANALISE_FINANCEIRA",
            }
          : p,
      ),
    );

  const cancelarPedido = (id: number) => {
    const pedido = pedidos.find((p) => p.id === id);
    if (pedido?.automovel) marcarDisponivel(pedido.automovel.id, true);
    setPedidos((lista) => lista.map((p) => (p.id === id ? { ...p, status: "CANCELADO" } : p)));
  };

  const value: AppState = {
    cliente,
    entrar: (email) => setCliente({ ...clienteExemplo, email: email || clienteExemplo.email }),
    sair: () => setCliente(null),
    salvarCliente: setCliente,
    pedidos,
    automovelLivre,
    criarPedido,
    editarPedido,
    cancelarPedido,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp precisa estar dentro de <AppProvider>");
  return ctx;
}
