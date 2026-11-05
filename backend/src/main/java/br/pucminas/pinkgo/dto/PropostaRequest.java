package br.pucminas.pinkgo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Banco escolhido para o crédito e em quantas vezes. */
public record PropostaRequest(
		@NotNull(message = "Escolha o banco.") Long bancoId,
		@NotNull(message = "Escolha em quantas vezes.") @Positive(message = "Escolha em quantas vezes.") Integer parcelas) {
}
