import { useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { filtroVazio, type FiltroState } from "../../lib/filtro";
import { formatBRL } from "../../lib/format";
import type { Modelo } from "../../types";
import { Checkbox } from "../ui/Field";
import { Icon } from "../ui/Icon";

const campoPequeno =
  "h-36 w-full rounded-md border border-neutral-border px-12 text-body-medium outline-none placeholder:text-neutral-secondary focus:border-brand-primary";

/* Dois sliders sobrepostos: o trilho é invisível e só as alças recebem clique. */
const trilho = [
  "pointer-events-none absolute inset-0 h-14 w-full appearance-none bg-transparent",
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-14 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-primary",
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-14 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand-primary",
].join(" ");

const toggle = <T,>(lista: T[], item: T) => (lista.includes(item) ? lista.filter((i) => i !== item) : [...lista, item]);

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  const [aberto, setAberto] = useState(true);
  return (
    <fieldset className="flex flex-col gap-12 border-b border-neutral-border py-12 last:border-b-0">
      <legend className="contents">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="flex w-full items-center justify-between text-body-bold"
        >
          {titulo}
          <Icon name="seta" size={20} rotate={aberto ? 0 : 180} className="text-brand-primary" />
        </button>
      </legend>
      {aberto && children}
    </fieldset>
  );
}

type FiltrosProps = { modelos: Modelo[]; valor: FiltroState; onChange: (f: FiltroState) => void };

export function Filtros({ modelos, valor, onChange }: FiltrosProps) {
  const set = (parcial: Partial<FiltroState>) => onChange({ ...valor, ...parcial });
  const marcas = [...new Set(modelos.map((m) => m.marca))];
  const anos = modelos.map((m) => m.ano);
  const anoPiso = Math.min(...anos);
  const anoTeto = Math.max(...anos);
  const diarias = modelos.map((m) => m.diaria);
  const precoPiso = Math.min(...diarias);
  const precoTeto = Math.max(...diarias);

  // Campo vazio = sem limite, então a alça fica na ponta da faixa.
  const limitar = (v: number) => Math.min(Math.max(v, precoPiso), precoTeto);
  const minAtual = valor.precoMin ? limitar(Number(valor.precoMin)) : precoPiso;
  const maxAtual = valor.precoMax ? limitar(Number(valor.precoMax)) : precoTeto;
  const pct = (v: number) => ((v - precoPiso) / (precoTeto - precoPiso || 1)) * 100;

  return (
    <aside className="flex w-320 shrink-0 flex-col self-start rounded-lg border border-neutral-border bg-neutral-white px-24 py-20">
      <div className="flex items-center justify-between border-b border-neutral-border pb-16">
        <span className="text-body-bold">Filtrar por</span>
        <button type="button" onClick={() => onChange(filtroVazio)} className="flex items-center gap-4 text-body-link">
          <Icon name="limpar" size={20} />
          Limpar
        </button>
      </div>

      <Grupo titulo="Marca">
        <div className="flex flex-wrap gap-6">
          {marcas.map((marca) => {
            const ativo = valor.marcas.includes(marca);
            return (
              <button
                key={marca}
                type="button"
                aria-pressed={ativo}
                onClick={() => set({ marcas: toggle(valor.marcas, marca) })}
                className={cn(
                  "h-36 rounded-pill border px-16",
                  ativo
                    ? "border-brand-primary bg-brand-primary text-body-bold text-neutral-white"
                    : "border-neutral-border text-body-medium hover:border-brand-pink",
                )}
              >
                {marca}
              </button>
            );
          })}
        </div>
      </Grupo>

      <Grupo titulo="Câmbio">
        <div className="flex flex-col gap-6">
          {["Automático", "Manual"].map((c) => (
            <Checkbox key={c} checked={valor.cambios.includes(c)} onChange={() => set({ cambios: toggle(valor.cambios, c) })}>
              <span className="text-body-medium">{c}</span>
            </Checkbox>
          ))}
        </div>
      </Grupo>

      <Grupo titulo="Combustível">
        <div className="flex flex-col gap-6">
          {[
            ["Flex", "Flex (Gasolina e Álcool)"],
            ["Híbrido", "Híbrido"],
            ["Elétrico", "Elétrico"],
          ].map(([v, rotulo]) => (
            <Checkbox
              key={v}
              checked={valor.combustiveis.includes(v)}
              onChange={() => set({ combustiveis: toggle(valor.combustiveis, v) })}
            >
              <span className="text-body-medium">{rotulo}</span>
            </Checkbox>
          ))}
        </div>
      </Grupo>

      <Grupo titulo="Capacidade de pessoas">
        <div className="flex flex-col gap-6">
          {[2, 4, 5, 7].map((n) => (
            <Checkbox key={n} checked={valor.assentos.includes(n)} onChange={() => set({ assentos: toggle(valor.assentos, n) })}>
              <span className="text-body-medium">{n}</span>
            </Checkbox>
          ))}
        </div>
      </Grupo>

      <Grupo titulo="Ano mínimo">
        <input
          type="number"
          aria-label="Ano mínimo"
          inputMode="numeric"
          min={anoPiso}
          max={anoTeto}
          placeholder={`A partir de ${anoPiso}`}
          value={valor.anoMinimo}
          onChange={(e) => set({ anoMinimo: e.target.value })}
          className={campoPequeno}
        />
      </Grupo>

      <Grupo titulo="Preço diária">
        <div className="flex flex-col gap-16">
          <div className="flex items-end gap-8">
            {(["precoMin", "precoMax"] as const).map((campo, i) => (
              <label key={campo} className="flex flex-1 flex-col gap-4">
                <span className="text-label-medium text-neutral-secondary">{i === 0 ? "Valor mínimo" : "Valor máximo"}</span>
                <input
                  type="number"
                  min={precoPiso}
                  max={precoTeto}
                  inputMode="numeric"
                  placeholder={formatBRL(i === 0 ? precoPiso : precoTeto)}
                  value={valor[campo]}
                  onChange={(e) => set({ [campo]: e.target.value })}
                  className={campoPequeno}
                />
              </label>
            ))}
          </div>
          <div className="relative h-14">
            <div className="absolute top-4 h-6 w-full rounded-pill bg-neutral-border" />
            <div
              className="absolute top-4 h-6 rounded-pill bg-brand-primary"
              style={{ left: `${pct(minAtual)}%`, width: `${pct(maxAtual) - pct(minAtual)}%` }}
            />
            <input
              type="range"
              aria-label="Diária mínima"
              min={precoPiso}
              max={precoTeto}
              step={10}
              value={minAtual}
              onChange={(e) => {
                const v = Math.min(Number(e.target.value), maxAtual);
                set({ precoMin: v === precoPiso ? "" : String(v) });
              }}
              className={trilho}
              // Com as alças juntas no topo, a do mínimo precisa ficar por cima para ainda poder ser arrastada.
              style={{ zIndex: pct(minAtual) > 50 ? 1 : undefined }}
            />
            <input
              type="range"
              aria-label="Diária máxima"
              min={precoPiso}
              max={precoTeto}
              step={10}
              value={maxAtual}
              onChange={(e) => {
                const v = Math.max(Number(e.target.value), minAtual);
                set({ precoMax: v === precoTeto ? "" : String(v) });
              }}
              className={trilho}
            />
          </div>
        </div>
      </Grupo>
    </aside>
  );
}
