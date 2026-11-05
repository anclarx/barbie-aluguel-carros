package br.pucminas.pinkgo.dto;

import br.pucminas.pinkgo.entity.Pedido;

/** Pedido no painel do agente: os dados do aluguel e o cliente, com os rendimentos usados na análise. */
public record PedidoAgenteResponse(PedidoResponse pedido, ClienteResponse cliente) {

	public static PedidoAgenteResponse de(Pedido p) {
		return new PedidoAgenteResponse(PedidoResponse.de(p), ClienteResponse.de(p.getCliente()));
	}
}
