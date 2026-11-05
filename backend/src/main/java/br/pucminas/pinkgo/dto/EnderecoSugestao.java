package br.pucminas.pinkgo.dto;

/** Endereço sugerido no autocomplete do cadastro. `descricao` é o texto que vai para o campo. */
public record EnderecoSugestao(String descricao, String logradouro, String numero, String bairro, String cidade,
		String uf, String cep) {
}
