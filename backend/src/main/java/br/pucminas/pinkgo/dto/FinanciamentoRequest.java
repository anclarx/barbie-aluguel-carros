package br.pucminas.pinkgo.dto;

import jakarta.validation.constraints.NotNull;

/** Banco que o cliente escolheu, entre os que aprovaram o crédito. */
public record FinanciamentoRequest(@NotNull(message = "Escolha um banco.") Long bancoId) {
}
