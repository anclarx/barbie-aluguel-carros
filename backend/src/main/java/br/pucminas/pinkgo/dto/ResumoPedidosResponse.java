package br.pucminas.pinkgo.dto;

import java.util.Map;

import br.pucminas.pinkgo.entity.StatusPedido;

/** Contagens dos cartões de situação em "Meus pedidos". */
public record ResumoPedidosResponse(long total, Map<StatusPedido, Long> porStatus) {
}
