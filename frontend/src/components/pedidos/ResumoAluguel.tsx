import type { ReactNode } from "react";
import type { FormularioPedido } from "../../hooks/useFormularioPedido";
import { formatJuros } from "../../lib/financiamento";
import { formatBRL, formatData } from "../../lib/format";
import type { Modelo } from "../../types";

function Linha({ rotulo, valor, className = "text-body-medium" }: { rotulo: string; valor: ReactNode; className?: string }) {
  return (
    <div className={`flex justify-between gap-16 ${className}`}>
      <dt className="text-neutral-secondary">{rotulo}</dt>
      <dd className="text-right">{valor}</dd>
    </div>
  );
}

type Props = { titulo: string; modelo: Modelo; form: FormularioPedido; children: ReactNode };

export function ResumoAluguel({ titulo, modelo, form, children }: Props) {
  const { valores, dias, total, simulacoes } = form;
  return (
    <>
      <section className="flex flex-col gap-12">
        <h3 className="text-body-medium">{titulo}</h3>
        <div className="flex flex-col gap-16 rounded-lg border border-neutral-border bg-neutral-white p-16">
          <dl className="flex flex-col gap-4 border-b border-neutral-border pb-16">
            <Linha rotulo="Automóvel" valor={modelo.nome} />
            <Linha
              rotulo="Período"
              valor={
                valores.dataRetirada && valores.dataEntrega
                  ? `${formatData(valores.dataRetirada)} → ${formatData(valores.dataEntrega)}`
                  : "—"
              }
            />
            <Linha rotulo="Duração" valor={`${dias} ${dias === 1 ? "dia" : "dias"}`} />
            <Linha rotulo="Diária" valor={formatBRL(modelo.diaria)} />
            <Linha rotulo="Liquidação" valor={valores.comCredito ? "Com crédito bancário" : "Sem crédito bancário"} />
          </dl>

          <div className="flex justify-between text-body-bold">
            <span>Total sem crédito</span>
            <span className="text-brand-primary">{formatBRL(total)}</span>
          </div>

          {simulacoes.length > 0 && (
            <div className="flex flex-col gap-8">
              <span className="text-label-medium text-neutral-secondary">Simulação com crédito bancário</span>
              {simulacoes.map(({ banco, simulacao: s }) => (
                <div key={banco.id} className="flex flex-col gap-8 rounded-md border border-neutral-border p-12">
                  <span className="text-label-bold">{banco.nome}</span>
                  <dl className="flex flex-col gap-2">
                    <Linha className="text-label-medium" rotulo={`Entrada (${banco.entradaMinima}%)`} valor={formatBRL(s.entrada)} />
                    <Linha className="text-label-medium" rotulo="Valor financiado" valor={formatBRL(s.valorFinanciado)} />
                    <Linha className="text-label-medium" rotulo="Juros" valor={formatJuros(banco)} />
                    <Linha className="text-label-medium" rotulo="Parcelas" valor={`${s.parcelas}x de ${formatBRL(s.valorParcela)}`} />
                    <Linha className="text-label-medium" rotulo="Total de juros" valor={formatBRL(s.totalJuros)} />
                  </dl>
                  <div className="flex justify-between border-t border-neutral-border pt-8 text-label-medium">
                    <span className="text-neutral-secondary">Total com financiamento</span>
                    <span className="text-label-bold">{formatBRL(s.totalComFinanciamento)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <div className="flex flex-col gap-8">{children}</div>
    </>
  );
}
