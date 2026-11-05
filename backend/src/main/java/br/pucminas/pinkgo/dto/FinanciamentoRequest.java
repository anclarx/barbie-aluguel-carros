package br.pucminas.pinkgo.dto;

import jakarta.validation.constraints.NotNull;

public record FinanciamentoRequest(@NotNull(message = "Escolha um banco.") Long bancoId) {
}
