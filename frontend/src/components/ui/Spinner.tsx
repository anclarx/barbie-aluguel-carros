import { cn } from "../../lib/cn";

/** Indicador de carregamento com texto para leitores de tela. */
export function Spinner({ rotulo = "Carregando…", className }: { rotulo?: string; className?: string }) {
  return (
    <div role="status" className={cn("flex items-center justify-center gap-12 p-40 text-neutral-secondary", className)}>
      <span className="size-24 animate-spin rounded-full border-2 border-brand-pink-soft border-t-brand-primary" />
      <span className="text-body-medium">{rotulo}</span>
    </div>
  );
}
