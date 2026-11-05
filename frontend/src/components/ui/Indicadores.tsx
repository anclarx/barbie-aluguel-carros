import { cn } from "../../lib/cn";

type IndicadoresProps = {
  total: number;
  atual: number;
  onSelect?: (i: number) => void;
  rotulo?: (i: number) => string;
};

export function Indicadores({ total, atual, onSelect, rotulo = (i) => `Imagem ${i + 1}` }: IndicadoresProps) {
  return (
    <div aria-hidden={!onSelect} className="flex items-center gap-4">
      {Array.from({ length: total }, (_, i) => {
        const classe = cn(
          "h-6 rounded-pill transition-all duration-300",
          i === atual ? "w-26 bg-brand-primary" : "w-6 bg-brand-pink-soft",
        );
        return onSelect ? (
          <button
            key={i}
            type="button"
            aria-label={rotulo(i)}
            aria-current={i === atual}
            onClick={() => onSelect(i)}
            className="flex h-16 items-center"
          >
            <span className={cn(classe, "block", i !== atual && "hover:bg-brand-pink")} />
          </button>
        ) : (
          <span key={i} className={classe} />
        );
      })}
    </div>
  );
}
