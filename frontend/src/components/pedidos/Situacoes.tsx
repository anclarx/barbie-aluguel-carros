import { cn } from "../../lib/cn";
import { SITUACOES, totalDaSituacao, type Situacao } from "../../lib/situacoes";
import type { ResumoPedidos } from "../../types";
import { Icon } from "../ui/Icon";

type CartoesProps = {
  resumo: ResumoPedidos | undefined;
  textos: Record<Situacao, string>;
  ativa: Situacao;
  onChange: (situacao: Situacao) => void;
};

/** Os cinco cartões lado a lado; o da situação escolhida fica rosa e filtra a lista. */
export function CartoesSituacao({ resumo, textos, ativa, onChange }: CartoesProps) {
  return (
    <div className="grid grid-cols-5 gap-16">
      {SITUACOES.map((s) => {
        const ativo = ativa === s.id;
        return (
          <button
            key={s.id}
            type="button"
            aria-pressed={ativo}
            onClick={() => onChange(s.id)}
            className={cn(
              "relative flex h-170 flex-col overflow-hidden rounded-lg border p-24 text-left",
              ativo
                ? "border-brand-primary bg-brand-primary text-neutral-white"
                : "border-neutral-border bg-neutral-white hover:border-brand-pink",
            )}
          >
            <Icon
              name={s.icon}
              size={144}
              className={cn("absolute -top-8 -right-16", ativo ? "text-neutral-white opacity-20" : "text-brand-primary opacity-10")}
            />
            <span className="relative text-body-bold">{s.titulo}</span>
            <span className="relative text-display-medium">{totalDaSituacao(resumo, s.id)}</span>
            <span className={cn("relative text-body-medium", ativo ? "text-brand-pink-soft" : "text-neutral-secondary")}>
              {textos[s.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Rótulo pequeno em cima de um valor, nas linhas da lista de pedidos. */
export function Info({ rotulo, valor, className }: { rotulo: string; valor: string; className?: string }) {
  return (
    <div className={cn("flex w-100 flex-col", className)}>
      <span className="text-label-medium text-neutral-secondary">{rotulo}</span>
      <span className="text-body-medium">{valor}</span>
    </div>
  );
}
