package br.pucminas.pinkgo.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/** US05: o cliente troca as lojas, o período, a forma de liquidação e os bancos. Lojas nulas ficam como estão. */
public record PedidoEdicaoRequest(
		Long localRetiradaId,
		Long localDevolucaoId,
		@NotNull(message = "Informe a data de retirada.") LocalDate dataRetirada,
		@NotNull(message = "Informe a data de entrega.") LocalDate dataEntrega,
		boolean comCredito,
		List<@Valid PropostaRequest> propostas) {
}
