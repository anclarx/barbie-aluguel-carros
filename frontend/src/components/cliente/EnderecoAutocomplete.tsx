import { useDebounce } from "../../hooks/useDebounce";
import { useEnderecos } from "../../hooks/useEnderecos";
import type { EnderecoSugestao } from "../../types";
import { Autocomplete } from "../ui/Autocomplete";

type Props = { label?: string; error?: string; valor: string; onChange: (endereco: string) => void };

/** Número que a pessoa digitou ("rua da bahia 1148" → "1148"), ignorando CEP. */
const numeroDigitado = (texto: string) => texto.match(/(?:^|[\s,])(\d{1,5})(?=$|[\s,])/)?.[1];

/**
 * O OpenStreetMap raramente tem o número de cada prédio. Se a sugestão vier sem número, mantém o que a pessoa
 * digitou: "Rua da Bahia, Centro, …" vira "Rua da Bahia, 1148, Centro, …".
 */
function comNumero(sugestao: EnderecoSugestao, texto: string) {
  const numero = numeroDigitado(texto);
  if (sugestao.numero || !numero) return sugestao.descricao;
  return sugestao.descricao.replace(sugestao.logradouro, `${sugestao.logradouro}, ${numero}`);
}

/**
 * Endereço residencial com sugestões do OpenStreetMap enquanto a pessoa digita. O campo continua livre: dá para
 * escrever um endereço que não aparece na lista, ou completar com apartamento depois de escolher.
 */
export function EnderecoAutocomplete({ label = "Endereço", error, valor, onChange }: Props) {
  const termo = useDebounce(valor.trim(), 300);
  const { dados, carregando, erro } = useEnderecos(termo);
  const sugestoes = termo === valor.trim() ? (dados ?? []) : [];

  return (
    <Autocomplete
      label={label}
      placeholder="Rua, número, bairro e cidade"
      icon="localizacao"
      error={error}
      autoComplete="street-address"
      texto={valor}
      onTextoChange={onChange}
      sugestoes={sugestoes}
      carregando={carregando || termo !== valor.trim()}
      erroBusca={erro ? "Não conseguimos buscar endereços agora. Você pode digitar o endereço completo." : undefined}
      minimoCaracteres={3}
      chave={(e) => e.descricao}
      renderSugestao={(e) => {
        const [rua, ...resto] = comNumero(e, valor).split(", ");
        // Com o número, a primeira linha mostra "Rua, 123".
        const linha1 = resto[0] && /^\d/.test(resto[0]) ? `${rua}, ${resto.shift()}` : rua;
        return (
          <>
            <span className="block truncate text-body-medium">{linha1}</span>
            <span className="block truncate text-label-medium text-neutral-secondary">{resto.join(", ")}</span>
          </>
        );
      }}
      onSelecionar={(e) => onChange(comNumero(e, valor))}
      vazio="Nenhum endereço encontrado. Você pode digitar o endereço completo."
      rodape={
        <>
          Dados ©{" "}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">
            OpenStreetMap
          </a>
        </>
      }
    />
  );
}
