import { useState } from "react";
import { cn } from "../../lib/cn";
import { formatBRL } from "../../lib/format";
import type { Modelo } from "../../types";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { CarAttributes, CarSpecIcons } from "./CarSpecs";

type Props = { modelo: Modelo | null; onClose: () => void; onAlugar: (modelo: Modelo) => void };

/** Modal "Detalhes do carro": fotos, descrição e características, sem a placa. */
export function CarDetailsModal({ modelo, onClose, onAlugar }: Props) {
  return (
    <Modal
      open={!!modelo}
      onClose={onClose}
      context="Detalhes do automóvel"
      title={modelo?.nome ?? ""}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={() => modelo && onAlugar(modelo)}>Alugar este carro</Button>
        </>
      }
    >
      {modelo && <Conteudo key={modelo.id} modelo={modelo} />}
    </Modal>
  );
}

function Conteudo({ modelo }: { modelo: Modelo }) {
  const [foto, setFoto] = useState(0);
  return (
    <div className="grid grid-cols-2 gap-24 px-8 py-4">
      <div className="flex flex-col gap-12">
        <div className="flex h-282 items-center justify-center rounded-lg border border-neutral-border p-16">
          <img src={modelo.fotos[foto]} alt={modelo.nome} className="max-h-full w-full object-contain" />
        </div>
        {modelo.fotos.length > 1 && (
          <div className="grid grid-cols-4 gap-12">
            {modelo.fotos.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Foto ${i + 1}`}
                onClick={() => setFoto(i)}
                className={cn(
                  "h-64 overflow-hidden rounded-md",
                  i === foto ? "border-2 border-brand-primary" : "border border-neutral-border",
                )}
              >
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="text-body-medium text-neutral-secondary">
            {modelo.marca} {modelo.ano}
          </span>
          <h3 className="text-[20px] font-semibold">{modelo.nome}</h3>
        </div>
        <p className="flex items-baseline gap-4">
          <span className="text-body-bold">{formatBRL(modelo.diaria)}</span>
          <span className="text-body-medium text-neutral-secondary">/ dia</span>
        </p>
        <CarSpecIcons modelo={modelo} />
        <p className="text-body-medium text-justify">{modelo.descricao}</p>
        <CarAttributes modelo={modelo} />
      </div>
    </div>
  );
}
