package br.pucminas.pinkgo.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * US03. As lojas vêm da busca da Início; quando faltam, o pedido usa a loja do automóvel reservado. Com crédito,
 * `propostas` traz os bancos escolhidos e o parcelamento em cada um.
 */
public record PedidoRequest(
		@NotNull(message = "Escolha o modelo.") Long modeloId,
		Long localRetiradaId,
		Long localDevolucaoId,
		@NotNull(message = "Informe a data de retirada.") LocalDate dataRetirada,
		@NotNull(message = "Informe a data de entrega.") LocalDate dataEntrega,
		boolean comCredito,
		List<@Valid PropostaRequest> propostas) {
}
