import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useFormularioPedido, type ValoresPedido } from "../../hooks/useFormularioPedido";
import { useToast } from "../../hooks/useToast";
import { guardarPedidoPendente } from "../../lib/pedidoPendente";
import { mensagemDeErro } from "../../services/http";
import { pedidoService } from "../../services/pedidoService";
import type { Modelo, Pedido } from "../../types";
import type { Busca } from "../carros/BuscaAluguel";
import { Button } from "../ui/Button";
import { ModalDuasColunas } from "../ui/ModalDuasColunas";
import { ResumoAluguel } from "./ResumoAluguel";
import { SecaoLiquidacao, SecaoLocalPeriodo, SecaoModelo } from "./SecoesPedido";

type Props = {
  modelo: Modelo | null;
  busca?: Busca | null;
  inicial?: ValoresPedido | null;
  onClose: () => void;
  onCriado: (pedido: Pedido) => void;
};

export function NovoPedidoModal({ modelo, busca, inicial, onClose, onCriado }: Props) {
  if (!modelo) return null;
  return (
    <Conteudo
      key={modelo.id}
      modelo={modelo}
      busca={busca ?? null}
      inicial={inicial ?? null}
      onClose={onClose}
      onCriado={onCriado}
    />
  );
}

type ConteudoProps = Pick<Props, "onClose" | "onCriado"> & {
  modelo: Modelo;
  busca: Busca | null;
  inicial: ValoresPedido | null;
};

function Conteudo({ modelo, busca, inicial, onClose, onCriado }: ConteudoProps) {
  const toast = useToast();
  const { cliente } = useAuth();
  const navigate = useNavigate();
  const form = useFormularioPedido(modelo, inicial ?? {
    localRetiradaId: busca ? String(busca.localRetiradaId) : "",
    localDevolucaoId: busca ? String(busca.localDevolucaoId) : "",
    dataRetirada: busca?.dataRetirada ?? "",
    dataEntrega: busca?.dataDevolucao ?? "",
    comCredito: false,
    escolhas: {},
  });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const irParaConta = (destino: "/login" | "/cadastro") => {
    guardarPedidoPendente({ modelo, valores: form.valores });
    navigate(destino, { state: { from: "/" } });
  };

  const enviar = async () => {
    const invalido = form.validar();
    if (invalido) {
      setErro(invalido);
      return toast.erro("Confira o pedido", invalido);
    }
    const { valores } = form;
    setEnviando(true);
    try {
      const pedido = await pedidoService.criar({
        modeloId: modelo.id,
        localRetiradaId: Number(valores.localRetiradaId),
        localDevolucaoId: Number(valores.localDevolucaoId),
        dataRetirada: valores.dataRetirada,
        dataEntrega: valores.dataEntrega,
        comCredito: valores.comCredito,
        propostas: form.propostas,
      });
      onCriado(pedido);
    } catch (e) {
      setErro(mensagemDeErro(e));
      toast.erro("Não foi possível enviar o pedido", mensagemDeErro(e));
      setEnviando(false);
    }
  };

  return (
    <ModalDuasColunas
      open
      onClose={onClose}
      contexto="Novo pedido"
      title="Período e forma de liquidação"
      aside={
        <ResumoAluguel titulo="Resumo do pedido de aluguel" modelo={modelo} form={form}>
          {cliente ? (
            <Button fullWidth onClick={enviar} disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar pedido para análise"}
            </Button>
          ) : (
            <>
              <p className="text-label-medium text-neutral-secondary">
                Para enviar o pedido, entre na sua conta. O que você escolheu aqui fica guardado.
              </p>
              <Button fullWidth onClick={() => irParaConta("/login")}>
                Entrar para enviar o pedido
              </Button>
              <Button fullWidth variant="secondary" onClick={() => irParaConta("/cadastro")}>
                Criar conta
              </Button>
            </>
          )}
          {erro && <p className="text-label-medium text-status-danger-text">{erro}</p>}
        </ResumoAluguel>
      }
    >
      <SecaoModelo modelo={modelo} />
      <SecaoLocalPeriodo form={form} />
      <SecaoLiquidacao
        form={form}
        dica="Escolha um ou mais bancos para comparar as condições de financiamento."
        aviso="Sujeito à análise de crédito. As condições podem variar de acordo com o seu perfil."
      />
    </ModalDuasColunas>
  );
}
