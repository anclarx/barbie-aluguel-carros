import { useState } from "react";
import { useFormularioPedido } from "../../hooks/useFormularioPedido";
import { useToast } from "../../hooks/useToast";
import type { EscolhasCredito } from "../../lib/financiamento";
import { mensagemDeErro } from "../../services/http";
import { pedidoService } from "../../services/pedidoService";
import type { Pedido, StatusProposta } from "../../types";
import { StatusBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ModalDuasColunas } from "../ui/ModalDuasColunas";
import { ResumoAluguel } from "./ResumoAluguel";
import { SecaoAutomovelReservado, SecaoLiquidacao, SecaoLocalPeriodo, SecaoModelo } from "./SecoesPedido";

type Props = { pedido: Pedido | null; onClose: () => void; onAlterado: () => void };

export function EditarPedidoModal({ pedido, onClose, onAlterado }: Props) {
  if (!pedido) return null;
  return <Conteudo key={pedido.id} pedido={pedido} onClose={onClose} onAlterado={onAlterado} />;
}

function Conteudo({ pedido, onClose, onAlterado }: Props & { pedido: Pedido }) {
  const toast = useToast();
  const escolhas: EscolhasCredito = Object.fromEntries(pedido.propostas.map((p) => [p.banco.id, p.parcelas]));
  const statusPorBanco: Record<number, StatusProposta> = Object.fromEntries(
    pedido.propostas.map((p) => [p.banco.id, p.status]),
  );
  const form = useFormularioPedido(pedido.modelo, {
    localRetiradaId: String(pedido.localRetirada.id),
    localDevolucaoId: String(pedido.localDevolucao.id),
    dataRetirada: pedido.dataRetirada,
    dataEntrega: pedido.dataEntrega,
    comCredito: pedido.comCredito,
    escolhas,
  }, pedido.localRetirada);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const salvar = async () => {
    const invalido = form.validar();
    if (invalido) {
      setErro(invalido);
      return toast.erro("Confira o pedido", invalido);
    }
    const { valores } = form;
    setEnviando(true);
    try {
      await pedidoService.editar(pedido.id, {
        localRetiradaId: Number(valores.localRetiradaId),
        localDevolucaoId: Number(valores.localDevolucaoId),
        dataRetirada: valores.dataRetirada,
        dataEntrega: valores.dataEntrega,
        comCredito: valores.comCredito,
        propostas: form.propostas,
      });
      onAlterado();
      onClose();
      toast.sucesso("Pedido atualizado", `O pedido #${pedido.codigo} segue em análise financeira com as novas escolhas.`);
    } catch (e) {
      setErro(mensagemDeErro(e));
      toast.erro("Não foi possível salvar o pedido", mensagemDeErro(e));
      setEnviando(false);
    }
  };

  return (
    <ModalDuasColunas
      open
      onClose={onClose}
      selo={<StatusBadge status={pedido.status} tamanho="md" />}
      contexto={`Pedido #${pedido.codigo}`}
      title="Editar pedido"
      aside={
        <ResumoAluguel titulo="Resumo atualizado" modelo={pedido.modelo} form={form}>
          {pedido.status === "APROVADO" && (
            <p className="text-label-medium text-status-warning-text">
              Ao salvar, o pedido aprovado volta para análise financeira.
            </p>
          )}
          <Button fullWidth onClick={salvar} disabled={enviando}>
            {enviando ? "Salvando…" : "Salvar alterações"}
          </Button>
          <Button fullWidth variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          {erro && <p className="text-label-medium text-status-danger-text">{erro}</p>}
        </ResumoAluguel>
      }
    >
      <SecaoModelo modelo={pedido.modelo} />
      <SecaoAutomovelReservado placa={pedido.automovel?.placa} />
      <SecaoLocalPeriodo form={form} />
      <SecaoLiquidacao
        form={form}
        statusPorBanco={statusPorBanco}
        dica="Bancos enviados para análise. Você pode incluir outros bancos ou remover os que não quiser mais."
        aviso="Ao salvar, os bancos incluídos são enviados para análise e os removidos têm a análise cancelada."
      />
    </ModalDuasColunas>
  );
}
