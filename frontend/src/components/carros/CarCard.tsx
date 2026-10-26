import { useEffect, useState } from "react";
import { cn } from "../../lib/cn";
import { formatBRL } from "../../lib/format";
import type { Modelo } from "../../types";
import { Button } from "../ui/Button";

const INTERVALO_FOTOS_MS = 1500;

function Indicadores({ total, atual }: { total: number; atual: number }) {
  return (
    <div aria-hidden className="flex gap-4">
      {Array.from({ length: Math.max(total, 3) }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-6 rounded-pill transition-all duration-300",
            i === atual ? "w-26 bg-brand-primary" : "w-6 bg-brand-pink-soft",
          )}
        />
      ))}
    </div>
  );
}

/** Foto do cartão que passa para as próximas enquanto o mouse está em cima (como na loja da Barbie). */
function GaleriaHover({ modelo, hover }: { modelo: Modelo; hover: boolean }) {
  // A primeira foto de `fotos` é a principal; no cartão usamos o recorte `imagemUrl` no lugar dela.
  const galeria = [modelo.imagemUrl, ...modelo.fotos.slice(1)];
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (!hover || galeria.length < 2) return;
    const id = setInterval(() => setAtual((i) => (i + 1) % galeria.length), INTERVALO_FOTOS_MS);
    return () => {
      clearInterval(id);
      setAtual(0);
    };
  }, [hover, galeria.length]);

  return (
    <>
      <div className="relative h-200 w-full overflow-hidden">
        {galeria.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === 0 ? modelo.nome : ""}
            className={cn(
              "absolute inset-0 size-full transition-opacity duration-500",
              i === 0 ? "object-contain" : "object-cover",
              i === atual ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>
      <div className="flex justify-center px-16">
        <Indicadores total={galeria.length} atual={atual} />
      </div>
    </>
  );
}

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

type CarCardProps = { modelo: Modelo; onAlugar: () => void; onDetalhes: () => void };

/** Cartão do carro na vitrine (Início). */
export function CarCard({ modelo, onAlugar, onDetalhes }: CarCardProps) {
  const [hover, setHover] = useState(false);
  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex flex-col gap-12 overflow-hidden rounded-lg border border-neutral-border bg-neutral-white pb-16"
    >
      <GaleriaHover modelo={modelo} hover={hover} />
      <div className="flex flex-col gap-12 px-16">
        <TituloModelo modelo={modelo} />
        <p className="flex items-baseline gap-4">
          <span className="text-body-bold">{formatBRL(modelo.diaria)}</span>
          <span className="text-label-medium text-neutral-secondary">/ dia</span>
        </p>
      </div>
      <div className="flex items-center gap-4 px-16">
        <Button className="flex-1" onClick={onAlugar}>
          Alugar
        </Button>
        <Button variant="link" className="px-12" onClick={onDetalhes}>
          Detalhes
        </Button>
      </div>
    </article>
  );
}

type CarOptionProps = { modelo: Modelo; selecionado: boolean; onSelect: () => void; onDetalhes: () => void };

/** Cartão selecionável no modal "Novo pedido · Etapa 1". */
export function CarOption({ modelo, selecionado, onSelect, onDetalhes }: CarOptionProps) {
  return (
    <div
      role="radio"
      aria-checked={selecionado}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect())}
      className={cn(
        "flex cursor-pointer flex-col gap-12 rounded-lg bg-neutral-white p-12",
        selecionado ? "border-2 border-brand-primary" : "border border-neutral-border hover:border-brand-pink",
      )}
    >
      <img src={modelo.imagemUrl} alt={modelo.nome} className="h-120 w-full object-contain" />
      <TituloModelo modelo={modelo} />
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-baseline">
          <span className="text-body-medium">{formatBRL(modelo.diaria)}</span>
          <span className="text-label-medium text-neutral-secondary">/dia</span>
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDetalhes();
          }}
          className="text-caption-bold text-brand-primary underline"
        >
          Detalhes
        </button>
      </div>
    </div>
  );
}
