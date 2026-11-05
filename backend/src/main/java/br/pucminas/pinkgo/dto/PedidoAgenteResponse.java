package br.pucminas.pinkgo.dto;

import br.pucminas.pinkgo.entity.Pedido;

public record PedidoAgenteResponse(PedidoResponse pedido, ClienteResponse cliente) {

	public static PedidoAgenteResponse de(Pedido p) {
		return new PedidoAgenteResponse(PedidoResponse.de(p), ClienteResponse.de(p.getCliente()));
	}
}
