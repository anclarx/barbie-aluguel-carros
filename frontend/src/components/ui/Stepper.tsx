import { Fragment } from "react";
import { cn } from "../../lib/cn";
import { Icon, type IconName } from "./Icon";

export type Etapa = { label: string; icon: IconName };

type StepperProps = {
  etapas: Etapa[];
  atual: number;
  layout?: "horizontal" | "vertical";
};

export function Stepper({ etapas, atual, layout = "horizontal" }: StepperProps) {
  return (
    <ol className="flex w-full items-center">
      {etapas.map((etapa, i) => {
        const concluida = i < atual;
        const ativa = i <= atual;
        return (
          <Fragment key={etapa.label}>
            {i > 0 && (
              <li
                aria-hidden
                className={cn("mx-8 h-2 flex-1", ativa ? "bg-brand-primary" : "bg-neutral-text", layout === "vertical" && "-mt-24")}
              />
            )}
            <li
              aria-current={i === atual ? "step" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-8",
                layout === "vertical" && "flex-col gap-4",
                ativa ? "text-brand-primary" : "text-neutral-text",
              )}
            >
              {concluida ? (
                <span className="flex size-28 items-center justify-center rounded-full bg-brand-primary text-neutral-white">
                  <Icon name="check" size={18} />
                </span>
              ) : (
                <Icon name={etapa.icon} size={layout === "vertical" ? 28 : 22} />
              )}
              <span className={layout === "vertical" ? "text-label-medium" : "text-body-medium"}>{etapa.label}</span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
