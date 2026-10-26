import { cn } from "../../lib/cn";
import { formatBRL } from "../../lib/format";
import type { Modelo } from "../../types";
import { Icon, type IconName } from "../ui/Icon";
import { TituloModelo } from "./CarCard";

function Spec({ icon, children }: { icon: IconName; children: string }) {
  return (
    <span className="flex items-center gap-4 text-label-medium">
      <Icon name={icon} size={16} />
      {children}
    </span>
  );
}

/** Ícones de câmbio, combustível, assentos e diária. */
export function CarSpecIcons({ modelo }: { modelo: Modelo }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-24 gap-y-4">
      <Spec icon="volante">{modelo.cambio}</Spec>
      <Spec icon="gasolina">{modelo.combustivel}</Spec>
      <Spec icon="assento">{`${modelo.assentos} assentos`}</Spec>
      <Spec icon="dinheiro">{`${formatBRL(modelo.diaria)}/dia`}</Spec>
    </div>
  );
}

/** Seguro, porta-malas, carroceria e cor. A placa nunca aparece aqui (US16). */
export function CarAttributes({ modelo }: { modelo: Modelo }) {
  const itens = [
    ["Seguro", modelo.seguro],
    ["Porta-malas", modelo.portaMalas],
    ["Carroceria", modelo.carroceria],
    ["Cor", modelo.cor],
    ...(modelo.autonomia ? [["Autonomia", modelo.autonomia]] : []),
  ];
  return (
    <dl className="grid grid-cols-4 gap-x-16 gap-y-12">
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo} className="flex flex-col gap-2">
          <dt className="text-label-medium text-neutral-secondary">{rotulo}</dt>
          <dd className="text-body-medium">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Cartão "Modelo do automóvel escolhido" (modais de pedido). */
export function CarResumoCard({ modelo, className }: { modelo: Modelo; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-16 rounded-lg border border-neutral-border p-16", className)}>
      <img src={modelo.imagemUrl} alt={modelo.nome} className="mx-auto h-120 w-180 object-contain" />
      <TituloModelo modelo={modelo} />
      <CarSpecIcons modelo={modelo} />
      <CarAttributes modelo={modelo} />
    </div>
  );
}
