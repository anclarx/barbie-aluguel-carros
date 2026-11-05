import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { formatBRL } from "../../lib/format";
import type { Modelo } from "../../types";
import { Button } from "../ui/Button";
import { Indicadores } from "../ui/Indicadores";
import { CarCaracteristicas, TituloModelo } from "./CarSpecs";

const INTERVALO_FOTOS_MS = 1500;

/** Foto do cartão que passa para as outras variações de cor enquanto o mouse está em cima (como na loja da Barbie). */
function GaleriaHover({ modelo, hover }: { modelo: Modelo; hover: boolean }) {
  // Cada foto é uma variação de cor do modelo; a primeira é a principal (`imagemUrl`).
  const galeria = modelo.fotos.length ? modelo.fotos : [modelo.imagemUrl];
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
              "absolute inset-0 size-full object-contain transition-opacity duration-500",
              i === atual ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>
      {/* Um ponto por variação; com uma foto só, não há o que indicar. */}
      {galeria.length > 1 && (
        <div className="flex justify-center px-16">
          <Indicadores total={galeria.length} atual={atual} />
        </div>
      )}
    </>
  );
}

/** Frente e verso ocupam a mesma célula do grid: o cartão fica com a altura do lado mais alto. */
const face =
  "col-start-1 row-start-1 flex flex-col overflow-hidden rounded-lg border border-neutral-border bg-neutral-white [backface-visibility:hidden]";

type CarCardProps = { modelo: Modelo; onAlugar: () => void };

/**
 * Cartão do carro na vitrine (Início). "Ver detalhes" vira o cartão e mostra no verso as características do modelo,
 * como nos grupos de carros da Localiza; "Esconder detalhes" desvira.
 */
export function CarCard({ modelo, onAlugar }: CarCardProps) {
  const [hover, setHover] = useState(false);
  const [virado, setVirado] = useState(false);
  const verDetalhes = useRef<HTMLButtonElement>(null);
  const esconderDetalhes = useRef<HTMLButtonElement>(null);

  // O foco acompanha o lado visível, para quem navega pelo teclado não ficar num botão escondido.
  const virar = (paraVerso: boolean) => {
    setVirado(paraVerso);
    requestAnimationFrame(() => (paraVerso ? esconderDetalhes : verDetalhes).current?.focus({ preventScroll: true }));
  };

  return (
    <article
      aria-label={modelo.nome}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="[perspective:1200px]"
    >
      <div
        className={cn(
          "grid transition-transform duration-500 ease-in-out [transform-style:preserve-3d] motion-reduce:transition-none",
          virado && "[transform:rotateY(180deg)]",
        )}
      >
        <div className={cn(face, "gap-12 pb-16")} aria-hidden={virado} inert={virado}>
          <GaleriaHover modelo={modelo} hover={hover && !virado} />
          <div className="flex flex-col gap-12 px-16">
            <TituloModelo modelo={modelo} />
            <p className="flex items-baseline gap-4">
              <span className="text-body-bold">{formatBRL(modelo.diaria)}</span>
              <span className="text-label-medium text-neutral-secondary">/ dia</span>
            </p>
          </div>
          <div className="mt-auto flex flex-col items-center gap-12 px-16">
            <Button fullWidth onClick={onAlugar}>
              Alugar
            </Button>
            <Button ref={verDetalhes} variant="link" onClick={() => virar(true)}>
              Ver detalhes
            </Button>
          </div>
        </div>

        {/* Verso: o título e as características do modelo em blocos, como nos grupos de carros da Localiza. */}
        <div
          className={cn(face, "gap-16 px-16 pt-24 pb-16 [transform:rotateY(180deg)]")}
          aria-hidden={!virado}
          inert={!virado}
        >
          <TituloModelo modelo={modelo} className="items-center text-center" />
          <CarCaracteristicas modelo={modelo} className="my-auto" />
          <Button ref={esconderDetalhes} variant="link" className="self-center" onClick={() => virar(false)}>
            Esconder detalhes
          </Button>
        </div>
      </div>
    </article>
  );
}
