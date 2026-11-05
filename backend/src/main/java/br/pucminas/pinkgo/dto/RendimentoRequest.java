package br.pucminas.pinkgo.dto;

import java.math.BigDecimal;

import br.pucminas.pinkgo.entity.Rendimento;
import br.pucminas.pinkgo.entity.TipoRendimento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record RendimentoRequest(
		@NotNull(message = "Escolha o tipo de rendimento.") TipoRendimento tipo,
		@Size(max = 120) String entidadeEmpregadora,
		@NotNull(message = "Informe o valor mensal.") @Positive(message = "O valor mensal precisa ser maior que zero.") BigDecimal valorMensal) {

	public Rendimento paraEntidade() {
		return new Rendimento(tipo, entidadeEmpregadora, valorMensal);
	}
}
