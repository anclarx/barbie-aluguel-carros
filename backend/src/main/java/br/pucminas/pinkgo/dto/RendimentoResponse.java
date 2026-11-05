package br.pucminas.pinkgo.dto;

import java.math.BigDecimal;

import br.pucminas.pinkgo.entity.Rendimento;
import br.pucminas.pinkgo.entity.TipoRendimento;

public record RendimentoResponse(Long id, TipoRendimento tipo, String entidadeEmpregadora, BigDecimal valorMensal) {

	public static RendimentoResponse de(Rendimento r) {
		return new RendimentoResponse(r.getId(), r.getTipo(), r.getEntidadeEmpregadora(), r.getValorMensal());
	}
}
