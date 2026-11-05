package br.pucminas.pinkgo.dto;

import br.pucminas.pinkgo.entity.TipoRendimento;

public record TipoRendimentoResponse(TipoRendimento value, String label, String campo) {

	public static TipoRendimentoResponse de(TipoRendimento t) {
		return new TipoRendimentoResponse(t, t.getRotulo(), t.getCampo());
	}
}
