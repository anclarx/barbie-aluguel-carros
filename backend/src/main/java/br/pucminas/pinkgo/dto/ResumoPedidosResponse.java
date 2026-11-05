package br.pucminas.pinkgo.dto;

import java.util.Map;

import br.pucminas.pinkgo.entity.StatusPedido;

public record ResumoPedidosResponse(long total, Map<StatusPedido, Long> porStatus) {
}
