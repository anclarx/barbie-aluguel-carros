package br.pucminas.pinkgo.dto;

import br.pucminas.pinkgo.entity.Local;

/** `descricao` é o texto pronto para a lista: "Belo Horizonte - MG · Savassi". */
public record LocalResponse(Long id, String bairro, String cidade, String uf, String descricao) {

	public static LocalResponse de(Local l) {
		return new LocalResponse(l.getId(), l.getBairro(), l.getCidade(), l.getUf(), l.getDescricao());
	}
}
