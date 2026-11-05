import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Props = { titulo: string; descricao?: string; acao?: ReactNode; className?: string };

export function EmptyState({ titulo, descricao, acao, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-16 rounded-lg border border-neutral-border bg-neutral-white p-40 text-center",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <p className="text-body-bold">{titulo}</p>
        {descricao && <p className="text-body-medium text-neutral-secondary">{descricao}</p>}
      </div>
      {acao}
    </div>
  );
}
