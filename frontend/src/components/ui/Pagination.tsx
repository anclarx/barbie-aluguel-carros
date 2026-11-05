import { cn } from "../../lib/cn";
import { Icon } from "./Icon";

type PaginationProps = { pagina: number; total: number; onChange: (pagina: number) => void };

const botao = "inline-flex h-38 items-center justify-center gap-8 rounded-md border text-body-medium disabled:opacity-50";
// Cores separadas: as duas variações nunca vão juntas no mesmo elemento (no Tailwind, a ordem da classe não decide).
const normal = "border-neutral-border bg-neutral-white text-brand-primary";
const atual = "border-brand-primary bg-brand-primary text-neutral-white";

export function Pagination({ pagina, total, onChange }: PaginationProps) {
  if (total <= 1) return null;
  return (
    <nav aria-label="Paginação" className="flex items-center gap-8">
      <button type="button" className={cn(botao, normal, "px-20")} disabled={pagina === 1} onClick={() => onChange(pagina - 1)}>
        <Icon name="seta" rotate={270} size={16} />
        Anterior
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          aria-current={n === pagina ? "page" : undefined}
          onClick={() => onChange(n)}
          className={cn(botao, "min-w-32 px-12", n === pagina ? atual : normal)}
        >
          {n}
        </button>
      ))}
      <button type="button" className={cn(botao, normal, "px-20")} disabled={pagina === total} onClick={() => onChange(pagina + 1)}>
        Próximo
        <Icon name="seta" rotate={90} size={16} />
      </button>
    </nav>
  );
}
