package br.pucminas.pinkgo.dto;

import br.pucminas.pinkgo.entity.Agente;

public record AgenteResponse(Long id, String nome, String email) {

	public static AgenteResponse de(Agente a) {
		return new AgenteResponse(a.getId(), a.getNome(), a.getEmail());
	}
}
