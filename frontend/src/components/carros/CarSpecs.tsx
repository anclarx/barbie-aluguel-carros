import { cn } from "../../lib/cn";
import { formatBRL } from "../../lib/format";
import type { Modelo } from "../../types";
import { Icon, type IconName } from "../ui/Icon";

function Spec({ icon, children }: { icon: IconName; children: string }) {
  return (
    <span className="flex items-center gap-4 text-label-medium">
      <Icon name={icon} size={16} />
      {children}
    </span>
  );
}

/** Marca e ano em cima do nome do modelo. */
export function TituloModelo({ modelo, className }: { modelo: Modelo; className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-label-medium text-neutral-secondary">
        {modelo.marca} {modelo.ano}
      </span>
      <span className="text-body-bold">{modelo.nome}</span>
    </div>
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

/**
 * Seguro, porta-malas e carroceria, numa linha e com a mesma largura (`minmax(0, 1fr)` não deixa um valor mais
 * comprido alargar a coluna). A placa nunca aparece aqui (US16).
 */
export function CarAttributes({ modelo, className }: { modelo: Modelo; className?: string }) {
  const itens = [
    ["Seguro", modelo.seguro],
    ["Porta-malas", modelo.portaMalas],
    ["Carroceria", modelo.carroceria],
  ];
  return (
    <dl className={cn("grid grid-cols-[repeat(3,minmax(0,1fr))] gap-x-8", className)}>
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo} className="flex min-w-0 flex-col gap-2">
          <dt className="truncate text-caption-medium text-neutral-secondary">{rotulo}</dt>
          <dd className="truncate text-label-medium">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Características do modelo em blocos com ícone, duas por linha: verso do cartão da vitrine (no estilo dos grupos
 * de carros da Localiza).
 */
export function CarCaracteristicas({ modelo, className }: { modelo: Modelo; className?: string }) {
  const itens: Array<[IconName, string]> = [
    ["gasolina", modelo.combustivel],
    ["volante", modelo.cambio],
    ["assento", `${modelo.assentos} assentos`],
    ["carro", modelo.carroceria],
    ["colecao", `Porta-malas ${modelo.portaMalas}`],
    ["seloVerificado", `Seguro ${modelo.seguro.toLowerCase()}`],
  ];
  return (
    <ul className={cn("grid grid-cols-2 gap-8", className)}>
      {itens.map(([icone, texto]) => (
        <li key={icone} className="flex min-h-56 items-center gap-8 rounded-md bg-page px-12 py-8 text-label-medium">
          <Icon name={icone} size={20} className="shrink-0 text-brand-primary" />
          <span className="min-w-0">{texto}</span>
        </li>
      ))}
    </ul>
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
