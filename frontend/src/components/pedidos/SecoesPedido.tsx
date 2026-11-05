import type { ReactNode } from "react";
import type { FormularioPedido } from "../../hooks/useFormularioPedido";
import { cn } from "../../lib/cn";
import { formatJuros, simular } from "../../lib/financiamento";
import { formatBRL, formatData, primeiraDevolucao, primeiraRetirada } from "../../lib/format";
import type { Banco, Local, Modelo, StatusProposta } from "../../types";
import { CarResumoCard } from "../carros/CarSpecs";
import { PropostaBadge } from "../ui/Badge";
import { Checkbox, DateField, SelectField } from "../ui/Field";
import { Icon } from "../ui/Icon";

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-12">
      <h3 className="text-body-medium">{titulo}</h3>
      {children}
    </section>
  );
}

export function SecaoModelo({ modelo }: { modelo: Modelo }) {
  return (
    <Secao titulo="Modelo do automóvel escolhido">
      <CarResumoCard modelo={modelo} />
    </Secao>
  );
}

export function SecaoAutomovelReservado({ placa }: { placa?: string }) {
  return (
    <Secao titulo="Detalhes do automóvel reservado">
      <div className="flex flex-col rounded-lg border border-neutral-border bg-neutral-white p-16">
        <span className="text-label-medium text-neutral-secondary">Placa</span>
        <span className="text-body-medium">{placa ?? "Definida ao enviar o pedido"}</span>
      </div>
    </Secao>
  );
}

export function SecaoLocalPeriodo({ form }: { form: FormularioPedido }) {
  const { valores, set, setDataRetirada, lojasRetirada, lojasDevolucao } = form;
  const opcoes = (lojas: Local[]) => lojas.map((l) => ({ value: String(l.id), label: l.descricao }));
  return (
    <Secao titulo="Local e período">
      <div className="flex flex-col gap-12">
        <SelectField
          label="Local de retirada"
          icon="localizacao"
          placeholder="Local de retirada"
          options={opcoes(lojasRetirada)}
          value={valores.localRetiradaId}
          onChange={(e) => set({ localRetiradaId: e.target.value })}
        />
        <SelectField
          label="Local de devolução"
          icon="localizacao"
          placeholder="Local de devolução"
          options={opcoes(lojasDevolucao)}
          value={valores.localDevolucaoId}
          onChange={(e) => set({ localDevolucaoId: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-12">
          <DateField
            label="Data de retirada"
            min={primeiraRetirada()}
            value={valores.dataRetirada}
            onChange={(e) => setDataRetirada(e.target.value)}
          />
          <DateField
            label="Data de devolução"
            min={primeiraDevolucao(valores.dataRetirada)}
            value={valores.dataEntrega}
            onChange={(e) => set({ dataEntrega: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-border pt-16 text-body-medium">
        <span className="text-neutral-secondary">Período</span>
        <span className="text-body-bold">
          {valores.dataRetirada && valores.dataEntrega
            ? `${formatData(valores.dataRetirada)} → ${formatData(valores.dataEntrega)}`
            : "—"}
        </span>
      </div>
    </Secao>
  );
}

type OpcaoProps = {
  selecionada: boolean;
  onSelecionar: () => void;
  titulo: string;
  descricao: string;
  valor?: string;
  children?: ReactNode;
};

function OpcaoLiquidacao({ selecionada, onSelecionar, titulo, descricao, valor, children }: OpcaoProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-16 rounded-lg bg-neutral-white p-16",
        selecionada ? "border-2 border-brand-primary" : "border border-neutral-border",
      )}
    >
      <label className="flex cursor-pointer items-start gap-12">
        <input
          type="radio"
          name="liquidacao"
          checked={selecionada}
          onChange={onSelecionar}
          className="mt-[1px] size-20 shrink-0 cursor-pointer appearance-none rounded-full border border-neutral-border bg-neutral-white checked:border-[6px] checked:border-brand-primary"
        />
        <span className="flex flex-1 flex-col gap-2">
          <span className={selecionada ? "text-body-bold" : "text-body-medium"}>{titulo}</span>
          <span className="text-label-medium text-neutral-secondary">{descricao}</span>
        </span>
        {valor && <span className="text-body-bold">{valor}</span>}
      </label>
      {selecionada && children}
    </div>
  );
}

type BancoProps = {
  banco: Banco;
  total: number;
  parcelas: number | undefined;
  status?: StatusProposta | "NAO_ENVIADO";
  onAlternar: () => void;
  onParcelas: (n: number) => void;
};

function BancoOpcao({ banco, total, parcelas, status, onAlternar, onParcelas }: BancoProps) {
  const escolhido = parcelas !== undefined;
  const simulacao = simular(total, banco, parcelas ?? Math.max(...banco.opcoesParcelas));
  return (
    <div className="flex flex-col gap-12 rounded-lg border border-neutral-border bg-neutral-white p-16">
      <div className="flex items-center gap-8">
        <Checkbox checked={escolhido} onChange={onAlternar} aria-label={`Usar o ${banco.nome}`} />
        <span aria-hidden className="flex size-46 shrink-0 items-center justify-center rounded-md bg-brand-pink-soft text-body-bold text-brand-primary">
          {banco.nome.replace("Banco ", "").charAt(0)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <span className="flex items-center gap-8 text-body-medium">
            {banco.nome}
            {status && <PropostaBadge status={status} />}
          </span>
          <span className="text-label-medium text-brand-primary">
            Juros a partir de <span className="text-label-bold">{formatJuros(banco)}</span>
          </span>
          <span className="flex items-center gap-8 text-label-medium">
            <span className="flex items-center gap-4">
              <Icon name="calendario" size={16} />
              Até {banco.parcelasMaximas}x
            </span>
            <span className="flex items-center gap-4">
              <Icon name="dinheiro" size={16} />
              Entrada mín. {banco.entradaMinima}%
            </span>
          </span>
          <span className="text-label-bold">{total > 0 ? formatBRL(simulacao.totalComFinanciamento) : "—"}</span>
        </div>
      </div>
      {escolhido && (
        <div className="flex flex-col gap-8 border-t border-neutral-border pt-12">
          <span className="text-label-medium text-neutral-secondary">Em quantas vezes?</span>
          <div className="flex gap-8" role="radiogroup" aria-label={`Parcelas no ${banco.nome}`}>
            {banco.opcoesParcelas.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={n === parcelas}
                onClick={() => onParcelas(n)}
                className={cn(
                  "h-32 rounded-pill border px-16 text-label-medium",
                  n === parcelas
                    ? "border-brand-primary bg-brand-pink-soft text-label-bold text-brand-primary"
                    : "border-neutral-border hover:border-brand-pink",
                )}
              >
                {n}x
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type LiquidacaoProps = {
  form: FormularioPedido;
  statusPorBanco?: Record<number, StatusProposta>;
  dica: string;
  aviso: string;
};

export function SecaoLiquidacao({ form, statusPorBanco, dica, aviso }: LiquidacaoProps) {
  const { valores, set, bancos, total, alternarBanco, definirParcelas } = form;
  return (
    <Secao titulo="Forma de liquidação">
      <OpcaoLiquidacao
        selecionada={!valores.comCredito}
        onSelecionar={() => set({ comCredito: false })}
        titulo="Sem crédito bancário"
        descricao="Você paga o aluguel direto para a PinkGo."
        valor={total > 0 ? formatBRL(total) : undefined}
      />
      <OpcaoLiquidacao
        selecionada={valores.comCredito}
        onSelecionar={() => set({ comCredito: true })}
        titulo="Com crédito bancário"
        descricao="Associe o aluguel a um financiamento. O banco analisa seus rendimentos."
      >
        <div className="flex flex-col gap-12 border-t border-neutral-border pt-16">
          <p className="text-body-medium text-neutral-secondary">{dica}</p>
          {bancos.map((banco) => (
            <BancoOpcao
              key={banco.id}
              banco={banco}
              total={total}
              parcelas={valores.escolhas[banco.id]}
              status={statusPorBanco && (statusPorBanco[banco.id] ?? "NAO_ENVIADO")}
              onAlternar={() => alternarBanco(banco)}
              onParcelas={(n) => definirParcelas(banco.id, n)}
            />
          ))}
          <p className="rounded-md bg-brand-pink-soft px-12 py-8 text-label-medium">{aviso}</p>
        </div>
      </OpcaoLiquidacao>
    </Secao>
  );
}
