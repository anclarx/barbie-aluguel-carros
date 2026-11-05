package br.pucminas.pinkgo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PropostaRequest(
		@NotNull(message = "Escolha o banco.") Long bancoId,
		@NotNull(message = "Escolha em quantas vezes.") @Positive(message = "Escolha em quantas vezes.") Integer parcelas) {
}
