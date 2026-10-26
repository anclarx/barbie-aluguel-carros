import { cn } from "../../lib/cn";
import { Icon } from "./Icon";

type PaginationProps = { pagina: number; total: number; onChange: (pagina: number) => void };

const botao =
  "inline-flex h-38 items-center justify-center gap-8 rounded-md border border-neutral-border bg-neutral-white text-body-medium text-brand-primary disabled:opacity-50";

export function Pagination({ pagina, total, onChange }: PaginationProps) {
  if (total <= 1) return null;
  return (
    <nav aria-label="Paginação" className="flex items-center gap-8">
      <button type="button" className={cn(botao, "px-20")} disabled={pagina === 1} onClick={() => onChange(pagina - 1)}>
        <Icon name="seta" rotate={270} size={16} />
        Anterior
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          aria-current={n === pagina ? "page" : undefined}
          onClick={() => onChange(n)}
          className={cn(botao, "min-w-32 px-12", n === pagina && "border-brand-primary bg-brand-primary text-neutral-white")}
        >
          {n}
        </button>
      ))}
      <button type="button" className={cn(botao, "px-20")} disabled={pagina === total} onClick={() => onChange(pagina + 1)}>
        Próximo
        <Icon name="seta" rotate={90} size={16} />
      </button>
    </nav>
  );
}
