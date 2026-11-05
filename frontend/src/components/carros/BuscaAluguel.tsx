import { useState, type FormEvent } from "react";
import { useLocais } from "../../hooks/useCatalogo";
import { useSessionState } from "../../hooks/useSessionState";
import { useToast } from "../../hooks/useToast";
import { CHAVES_SESSAO } from "../../lib/chavesSessao";
import { primeiraDevolucao, primeiraRetirada } from "../../lib/format";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { PickerDate, PickerSelect } from "../ui/PickerField";

/** Busca confirmada, já com os ids das lojas. */
export type Busca = { localRetiradaId: number; localDevolucaoId: number; dataRetirada: string; dataDevolucao: string };

/** Valores do formulário: os selects guardam o id da loja como texto. */
type Campos = Record<"localRetirada" | "localDevolucao" | "dataRetirada" | "dataDevolucao", string>;

const camposVazios: Campos = { localRetirada: "", localDevolucao: "", dataRetirada: "", dataDevolucao: "" };

const rotulos: Campos = {
  localRetirada: "Local de retirada",
  localDevolucao: "Local de devolução",
  dataRetirada: "Data de retirada",
  dataDevolucao: "Data de devolução",
};

type Props = { onPesquisar: (busca: Busca) => void; onLimpar: () => void };

/** Card de busca sobre o banner da Início: loja e período do aluguel. */
export function BuscaAluguel({ onPesquisar, onLimpar }: Props) {
  // As lojas são fixas (onde a PinkGo tem agência), então a pessoa escolhe numa lista.
  const lojas = (useLocais().dados ?? []).map((l) => ({ value: String(l.id), label: l.descricao }));
  const [valor, setValor] = useSessionState(CHAVES_SESSAO.camposBusca, camposVazios);
  const [erros, setErros] = useState<Partial<Campos>>({});
  const toast = useToast();

  const campo = (nome: keyof Campos) => ({
    value: valor[nome],
    error: erros[nome],
    onChange: (e: { target: { value: string } }) => setValor((v) => ({ ...v, [nome]: e.target.value })),
  });

  const pesquisar = (ev: FormEvent) => {
    ev.preventDefault();
    const e: typeof erros = {};
    if (!valor.localRetirada) e.localRetirada = "Escolha onde retirar.";
    if (!valor.localDevolucao) e.localDevolucao = "Escolha onde devolver.";
    if (!valor.dataRetirada) e.dataRetirada = "Informe a data.";
    else if (valor.dataRetirada < primeiraRetirada()) e.dataRetirada = "A partir de amanhã.";
    if (!valor.dataDevolucao) e.dataDevolucao = "Informe a data.";
    else if (valor.dataDevolucao < primeiraDevolucao(valor.dataRetirada))
      e.dataDevolucao = "Pelo menos 1 dia após a retirada.";
    setErros(e);
    if (Object.keys(e).length) {
      // Embaixo do campo a mensagem é curta; no aviso, o título diz de qual campo ela é.
      toast.camposInvalidos(e, "Confira a busca", rotulos);
      return;
    }
    onPesquisar({
      localRetiradaId: Number(valor.localRetirada),
      localDevolucaoId: Number(valor.localDevolucao),
      dataRetirada: valor.dataRetirada,
      dataDevolucao: valor.dataDevolucao,
    });
  };

  const limpar = () => {
    setValor(camposVazios);
    setErros({});
    onLimpar();
  };

  return (
    <form
      id="busca"
      onSubmit={pesquisar}
      noValidate
      className="relative mx-auto -mt-88 flex max-w-page items-start gap-32 rounded-lg border border-neutral-border bg-page p-32"
    >
      <div className="grid flex-1 grid-cols-[1fr_1fr_156px_156px] gap-16">
        <PickerSelect
          label="Local de retirada"
          icon="localizacao"
          placeholder="Local de retirada"
          options={lojas}
          {...campo("localRetirada")}
          // Quem ainda não escolheu onde devolver costuma devolver na mesma loja.
          onChange={(e) => {
            const localRetirada = e.target.value;
            setValor((v) => ({ ...v, localRetirada, localDevolucao: v.localDevolucao || localRetirada }));
          }}
        />
        <PickerSelect
          label="Local de devolução"
          icon="localizacao"
          placeholder="Local de devolução"
          options={lojas}
          {...campo("localDevolucao")}
        />
        <PickerDate
          label="Data de retirada"
          min={primeiraRetirada()}
          {...campo("dataRetirada")}
          // Se a devolução ficou antes do mínimo da nova retirada, ela é apagada para a pessoa escolher de novo.
          onChange={(e) => {
            const dataRetirada = e.target.value;
            setValor((v) => ({
              ...v,
              dataRetirada,
              dataDevolucao: v.dataDevolucao && v.dataDevolucao < primeiraDevolucao(dataRetirada) ? "" : v.dataDevolucao,
            }));
          }}
        />
        <PickerDate label="Data de devolução" min={primeiraDevolucao(valor.dataRetirada)} {...campo("dataDevolucao")} />
      </div>
      <div className="flex w-143 shrink-0 flex-col gap-4">
        <Button type="submit" fullWidth>
          Pesquisar
        </Button>
        <button
          type="button"
          onClick={limpar}
          className="inline-flex h-36 items-center justify-center gap-4 rounded-pill text-body-link text-brand-primary hover:text-brand-primary-hover"
        >
          <Icon name="limpar" size={20} />
          Limpar
        </button>
      </div>
    </form>
  );
}
