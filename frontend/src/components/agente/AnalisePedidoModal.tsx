import { useState, type ReactNode } from "react";
import { useTiposRendimento } from "../../hooks/useCatalogo";
import { useToast } from "../../hooks/useToast";
import { cn } from "../../lib/cn";
import { TIPOS_CONTRATO } from "../../lib/contrato";
import { etapaCredito, propostaEscolhida, type EtapaCredito } from "../../lib/credito";
import { diasEntre, formatBRL, formatData } from "../../lib/format";
import { mascaraRg } from "../../lib/mascaras";
import { rendaTotal } from "../../lib/rendimentos";
import { agenteService, type AcaoAgente } from "../../services/agenteService";
import { mensagemDeErro } from "../../services/http";
import type { Local, Pedido, PedidoAgente, Proposta, TipoContrato } from "../../types";
import { PropostaBadge, StatusBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

type Props = {
  item: PedidoAgente | null;
  onClose: () => void;
  /** Depois de um parecer, a lista e as contagens do painel recarregam. */
  onAlterado: () => void;
};

/** Regra interna da PinkGo: o aluguel (ou a parcela) pode ocupar até metade da renda mensal. */
const LIMITE_RENDA = 50;

const sucesso: Record<AcaoAgente, string> = {
  aprovacao: "Pedido aprovado",
  negacao: "Pedido negado",
  "inicio-contrato": "Contrato iniciado",
  encerramento: "Contrato encerrado",
};

/** Linha de apoio de "Respostas dos bancos", conforme a etapa do crédito. */
const recadoBancos: Record<EtapaCredito, string> = {
  "sem-credito": "",
  "bancos-analisando": "Os bancos respondem em instantes.",
  "escolher-banco": "Os bancos responderam. O cliente escolhe qual vai financiar.",
  "nenhum-aprovou": "Nenhum banco aprovou. O cliente precisa seguir sem financiamento.",
  "banco-escolhido": "O cliente já escolheu o banco. Agora o parecer é seu.",
};

/** CPF com o começo e o fim escondidos: ***.482.917-** */
const cpfParcial = (cpf: string) => {
  const d = cpf.replace(/\D/g, "");
  return d.length === 11 ? `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**` : cpf;
};

const percentual = (n: number) => `${n.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
const loja = (l: Local) => `${l.cidade} · ${l.bairro}`;
/** "24/11 → 31/12/2026": o ano aparece uma vez quando as duas datas são do mesmo ano. */
const periodo = (inicio: string, fim: string) =>
  inicio.slice(0, 4) === fim.slice(0, 4)
    ? `${formatData(inicio).slice(0, 5)} → ${formatData(fim)}`
    : `${formatData(inicio)} → ${formatData(fim)}`;

/**
 * Quanto o aluguel pesa por mês: com financiamento escolhido, a parcela; sem, o total do aluguel (até 30 dias) ou a
 * parte de um mês dele (aluguéis mais longos).
 */
function equivalenteMensal(pedido: Pedido) {
  const escolhida = propostaEscolhida(pedido);
  if (escolhida) return escolhida.simulacao.valorParcela;
  const dias = diasEntre(pedido.dataRetirada, pedido.dataEntrega);
  return dias <= 30 ? pedido.totalEstimado : (pedido.totalEstimado * 30) / dias;
}

function Secao({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <h3 className="text-body-bold">{titulo}</h3>
        {subtitulo && <p className="text-caption-medium text-neutral-secondary">{subtitulo}</p>}
      </div>
      {children}
    </section>
  );
}

const cartao = "flex flex-col gap-16 rounded-lg border border-neutral-border bg-neutral-white p-20";

function Dado({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption-medium text-neutral-secondary">{rotulo}</span>
      <span className="text-label-medium">{valor}</span>
    </div>
  );
}

/** Rótulo à esquerda e valor à direita, como os rendimentos do cliente. */
function Linha({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-12 text-label-medium">
      <span className="text-neutral-secondary">{rotulo}</span>
      <span className="text-right">{valor}</span>
    </div>
  );
}

function Total({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="mt-auto flex items-baseline justify-between gap-12 border-t border-neutral-border pt-12">
      <span className="text-label-medium text-neutral-secondary">{rotulo}</span>
      <span className="text-body-bold">{valor}</span>
    </div>
  );
}

/** Resposta de um banco: a simulação completa quando aprovou, o motivo quando negou. */
function CartaoBanco({ proposta, apagado }: { proposta: Proposta; apagado: boolean }) {
  const { banco, simulacao: s } = proposta;
  const aprovada = proposta.status === "APROVADA";
  return (
    <li
      className={cn(
        cartao,
        "gap-12 p-16",
        proposta.escolhida && "border-2 border-brand-primary",
        apagado && "opacity-55",
      )}
    >
      <div className="flex items-start justify-between gap-12">
        <div className="flex flex-col">
          <span className="text-body-bold">{banco.nome}</span>
          <span className="text-caption-medium text-neutral-secondary">{percentual(banco.jurosMensal)} a.m.</span>
        </div>
        <div className="flex flex-wrap justify-end gap-6">
          {proposta.escolhida && (
            <span className="rounded-pill bg-brand-primary px-8 py-2 text-caption-bold text-neutral-white">
              Escolhido pelo cliente
            </span>
          )}
          <PropostaBadge status={proposta.status} />
        </div>
      </div>
      {aprovada && (
        <>
          <div className="flex items-baseline justify-between gap-12 rounded-md bg-brand-pink-soft px-12 py-10">
            <span className="text-caption-medium text-neutral-secondary">Parcelamento</span>
            <span className="text-body-bold text-brand-primary">
              {s.parcelas}x de {formatBRL(s.valorParcela)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-12">
            <Dado rotulo="Entrada" valor={formatBRL(s.entrada)} />
            <Dado rotulo="Valor financiado" valor={formatBRL(s.valorFinanciado)} />
            <Dado rotulo="Total de juros" valor={formatBRL(s.totalJuros)} />
            <Dado rotulo="Total com financiamento" valor={formatBRL(s.totalComFinanciamento)} />
          </div>
        </>
      )}
      <p className="border-t border-neutral-border pt-10 text-caption-medium text-neutral-secondary">
        {proposta.status === "EM_ANALISE" ? "Respondendo em instantes…" : proposta.motivo}
      </p>
    </li>
  );
}

/**
 * Análise financeira do pedido pelo agente da PinkGo (Figma, "Modal análise financeira v2"): quem é o cliente e quanto
 * ganha, o carro e o período, quanto o aluguel pesa na renda, o tipo de contrato e as respostas dos bancos. O parecer
 * favorável só sai depois dos bancos e da escolha do cliente.
 */
export function AnalisePedidoModal({ item, onClose, onAlterado }: Props) {
  if (!item) return null;
  return <Conteudo key={item.pedido.id} item={item} onClose={onClose} onAlterado={onAlterado} />;
}

function Conteudo({ item, onClose, onAlterado }: Props & { item: PedidoAgente }) {
  const toast = useToast();
  const tipos = useTiposRendimento().dados ?? [];
  const { pedido, cliente } = item;
  const { modelo } = pedido;
  const [justificativa, setJustificativa] = useState("");
  const [tipoContrato, setTipoContrato] = useState<TipoContrato>(pedido.tipoContrato);
  const [enviando, setEnviando] = useState(false);

  const renda = rendaTotal(cliente.rendimentos);
  const mensal = equivalenteMensal(pedido);
  const peso = renda > 0 ? Math.round((mensal / renda) * 100) : 100;
  const dentroDaRegra = peso <= LIMITE_RENDA;
  const dias = diasEntre(pedido.dataRetirada, pedido.dataEntrega);
  const escolhida = propostaEscolhida(pedido);
  const emAnalise = pedido.status === "EM_ANALISE_FINANCEIRA";

  const agir = async (acao: AcaoAgente) => {
    setEnviando(true);
    try {
      await agenteService.agir(pedido.id, acao, { justificativa, tipoContrato });
      toast.sucesso(sucesso[acao], `Pedido #${pedido.codigo} de ${cliente.nome}.`);
      onAlterado();
      onClose();
    } catch (e) {
      toast.erro("Não foi possível registrar o parecer", mensagemDeErro(e));
      setEnviando(false);
    }
  };

  const rodape = emAnalise ? (
    <>
      <Button variant="danger" onClick={() => agir("negacao")} disabled={enviando}>
        Negar pedido
      </Button>
      <Button onClick={() => agir("aprovacao")} disabled={enviando || !!pedido.pendenciaParaAprovar}>
        Aprovar pedido
      </Button>
    </>
  ) : pedido.status === "APROVADO" ? (
    <Button onClick={() => agir("inicio-contrato")} disabled={enviando}>
      Iniciar contrato
    </Button>
  ) : pedido.status === "CONTRATO_EM_EXECUCAO" ? (
    <Button onClick={() => agir("encerramento")} disabled={enviando}>
      Encerrar contrato
    </Button>
  ) : (
    <Button variant="secondary" onClick={onClose}>
      Fechar
    </Button>
  );

  return (
    <Modal
      open
      onClose={onClose}
      selo={<StatusBadge status={pedido.status} tamanho="md" />}
      context="Análise financeira"
      title={`Pedido #${pedido.codigo} · ${cliente.nome}`}
      footer={rodape}
    >
      <div className="flex flex-col gap-20">
        {emAnalise && pedido.pendenciaParaAprovar && (
          <p className="rounded-md bg-status-warning-bg px-12 py-8 text-label-medium text-status-warning-text">
            {pedido.pendenciaParaAprovar} O parecer favorável fica disponível depois disso.
          </p>
        )}

        <div className="grid grid-cols-2 items-stretch gap-16">
          <Secao titulo="Cliente">
            <div className={cn(cartao, "h-full")}>
              <div className="grid grid-cols-3 gap-12">
                <Dado rotulo="CPF" valor={cpfParcial(cliente.cpf)} />
                <Dado rotulo="RG" valor={mascaraRg(cliente.rg)} />
                <Dado rotulo="Profissão" valor={cliente.profissao} />
              </div>
              <div className="flex flex-col gap-8">
                <span className="text-caption-medium text-neutral-secondary">Empregadores e rendimentos</span>
                <ul className="flex flex-col gap-8">
                  {cliente.rendimentos.map((r) => (
                    <li key={r.id} className="flex items-baseline justify-between gap-12 text-label-medium">
                      <span>{r.entidadeEmpregadora || tipos.find((t) => t.value === r.tipo)?.label || r.tipo}</span>
                      <span className="text-label-bold">{formatBRL(r.valorMensal)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Total rotulo="Renda mensal total" valor={formatBRL(renda)} />
            </div>
          </Secao>

          <Secao titulo="Pedido">
            <div className={cn(cartao, "h-full")}>
              <div className="flex items-center gap-16">
                <div className="flex h-72 w-112 shrink-0 items-center justify-center rounded-md bg-page p-4">
                  <img src={modelo.imagemUrl} alt="" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-caption-medium text-neutral-secondary">
                    {modelo.marca} · {modelo.ano}
                  </span>
                  <span className="text-body-bold">{modelo.nome}</span>
                  {pedido.automovel && (
                    <span
                      className="w-fit rounded-pill bg-brand-pink-soft px-8 py-2 text-caption-bold text-brand-primary"
                      title="Placa reservada"
                    >
                      {pedido.automovel.placa}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-10 border-t border-neutral-border pt-16">
                <Linha
                  rotulo="Período"
                  valor={`${periodo(pedido.dataRetirada, pedido.dataEntrega)} · ${dias} dias`}
                />
                <Linha rotulo="Retirada" valor={loja(pedido.localRetirada)} />
                <Linha rotulo="Devolução" valor={loja(pedido.localDevolucao)} />
              </div>
              <Total rotulo="Valor total" valor={formatBRL(pedido.totalEstimado)} />
            </div>
          </Secao>
        </div>

        <div className="flex flex-col gap-8 px-4">
          <div className="flex items-baseline justify-between gap-12">
            <span className="text-label-medium text-neutral-secondary">
              {escolhida ? "Parcela mensal escolhida" : "Equivalente mensal"} ({formatBRL(mensal)})
            </span>
            <span className={cn("text-body-bold", dentroDaRegra ? "text-status-success-text" : "text-status-danger-text")}>
              {peso}% da renda
            </span>
          </div>
          <div className="h-8 overflow-hidden rounded-pill bg-page" aria-hidden>
            <div
              className={cn("h-full rounded-pill", dentroDaRegra ? "bg-status-success-text" : "bg-status-danger-text")}
              style={{ width: `${Math.max(Math.min(peso, 100), 1)}%` }}
            />
          </div>
          <span className="text-caption-medium text-neutral-secondary">
            {dentroDaRegra
              ? `Dentro da regra interna (até ${LIMITE_RENDA}% da renda mensal). Sugestão: parecer positivo.`
              : `Acima da regra interna (até ${LIMITE_RENDA}% da renda mensal). Sugestão: parecer negativo.`}
          </span>
        </div>

        <Secao
          titulo="Tipo de contrato"
          subtitulo={
            emAnalise
              ? "Em nome de quem o automóvel fica durante o contrato. Decisão do agente."
              : "Em nome de quem o automóvel fica durante o contrato."
          }
        >
          <div role="radiogroup" aria-label="Tipo de contrato" className="grid grid-cols-3 gap-12">
            {TIPOS_CONTRATO.map((t) => {
              const marcado = tipoContrato === t.valor;
              const bloqueado = !emAnalise || (t.valor === "PROPRIEDADE_BANCO" && !pedido.comCredito);
              return (
                <button
                  key={t.valor}
                  type="button"
                  role="radio"
                  aria-checked={marcado}
                  disabled={bloqueado}
                  onClick={() => setTipoContrato(t.valor)}
                  title={
                    t.valor === "PROPRIEDADE_BANCO" && !pedido.comCredito ? "Só para pedidos com financiamento." : undefined
                  }
                  className={cn(
                    "flex items-start gap-10 rounded-lg border p-16 text-left transition-colors",
                    marcado
                      ? "border-2 border-brand-primary bg-brand-pink-soft"
                      : "border-neutral-border bg-neutral-white enabled:hover:border-brand-pink",
                    bloqueado && !marcado && "opacity-50",
                    bloqueado ? "cursor-default" : "cursor-pointer",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-2 flex size-18 shrink-0 items-center justify-center rounded-pill border-2",
                      marcado ? "border-brand-primary" : "border-neutral-border",
                    )}
                  >
                    {marcado && <span className="size-10 rounded-pill bg-brand-primary" />}
                  </span>
                  <span className="flex flex-col gap-2">
                    <span className="text-label-bold">{t.rotulo}</span>
                    <span className="text-caption-medium text-neutral-secondary">{t.descricao}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Secao>

        {pedido.comCredito && (
          <Secao titulo="Respostas dos bancos" subtitulo={recadoBancos[etapaCredito(pedido)]}>
            <ul className="grid grid-cols-2 items-start gap-12">
              {pedido.propostas.map((p) => (
                <CartaoBanco key={p.id} proposta={p} apagado={!!escolhida && !p.escolhida} />
              ))}
            </ul>
          </Secao>
        )}

        {emAnalise ? (
          <label className="flex flex-col gap-8">
            <span className="text-body-bold">Justificativa do parecer (opcional)</span>
            <textarea
              rows={3}
              maxLength={500}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Registre os critérios usados na decisão"
              className="resize-none rounded-md border border-neutral-border px-16 py-12 text-body-medium outline-none placeholder:text-neutral-secondary focus:border-brand-primary"
            />
          </label>
        ) : (
          pedido.justificativaParecer && (
            <Secao titulo="Justificativa do parecer">
              <p className={cn(cartao, "text-body-medium")}>{pedido.justificativaParecer}</p>
            </Secao>
          )
        )}
      </div>
    </Modal>
  );
}
