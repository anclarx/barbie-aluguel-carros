import { useTiposRendimento } from "../../hooks/useCatalogo";
import { formatBRL } from "../../lib/format";
import { valorDaMascaraMoeda } from "../../lib/mascaras";
import { MAX_RENDIMENTOS, novoRendimento, rendaTotal } from "../../lib/rendimentos";
import type { Rendimento, TipoRendimento } from "../../types";
import { Tag } from "../ui/Badge";
import { Button } from "../ui/Button";
import { SelectField, TextField } from "../ui/Field";
import { Icon } from "../ui/Icon";

type Props = { rendimentos: Rendimento[]; onChange: (rendimentos: Rendimento[]) => void };

/** Lista de 1 a 3 rendimentos com campos por categoria e renda mensal total. */
export function RendimentosEditor({ rendimentos, onChange }: Props) {
  const tipos = useTiposRendimento().dados ?? [];
  const atualizar = (id: number, parcial: Partial<Rendimento>) =>
    onChange(rendimentos.map((r) => (r.id === id ? { ...r, ...parcial } : r)));

  return (
    <div className="flex flex-col gap-16">
      {rendimentos.map((r, i) => {
        const campoExtra = tipos.find((t) => t.value === r.tipo)?.campo;
        const valor = (
          <TextField
            label="Valor mensal"
            inputMode="numeric"
            placeholder="R$0,00"
            value={r.valorMensal ? formatBRL(r.valorMensal) : ""}
            onChange={(e) => atualizar(r.id, { valorMensal: valorDaMascaraMoeda(e.target.value) })}
          />
        );
        return (
          <div key={r.id} className="flex flex-col gap-12 rounded-lg border border-neutral-border bg-neutral-white p-12">
            <div className="flex items-center justify-between">
              <Tag>Rendimento {i + 1}</Tag>
              {rendimentos.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remover rendimento ${i + 1}`}
                  onClick={() => onChange(rendimentos.filter((x) => x.id !== r.id))}
                  className="text-brand-primary"
                >
                  <Icon name="fechar" size={20} />
                </button>
              )}
            </div>
            <SelectField
              label="Tipo de rendimento"
              placeholder="Escolha um rendimento"
              value={r.tipo}
              onChange={(e) => atualizar(r.id, { tipo: e.target.value as TipoRendimento })}
              options={tipos}
            />
            {campoExtra ? (
              <div className="grid grid-cols-2 gap-12">
                <TextField
                  label={campoExtra}
                  placeholder={campoExtra === "Nome empresa" ? "Nome da empresa" : campoExtra}
                  value={r.entidadeEmpregadora ?? ""}
                  onChange={(e) => atualizar(r.id, { entidadeEmpregadora: e.target.value })}
                />
                {valor}
              </div>
            ) : (
              valor
            )}
          </div>
        );
      })}

      {rendimentos.length < MAX_RENDIMENTOS && (
        <Button
          variant="secondary"
          className="self-start"
          icon={<Icon name="adicao" size={20} />}
          onClick={() => onChange([...rendimentos, novoRendimento()])}
        >
          Adicionar rendimento
        </Button>
      )}

      <div className="flex items-center justify-between border-y border-neutral-border py-20">
        <span className="text-body-medium text-neutral-secondary">Renda mensal total</span>
        <span className="text-body-bold">{formatBRL(rendaTotal(rendimentos))}</span>
      </div>
    </div>
  );
}
