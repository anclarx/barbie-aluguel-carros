package br.pucminas.pinkgo.entity;

import java.time.LocalDate;

public final class Disponibilidade {

	public static final int DIAS_PREPARACAO = 2;

	public static final String CONFLITO = """
			(
				(p.status in (br.pucminas.pinkgo.entity.StatusPedido.EM_ANALISE_FINANCEIRA,
						br.pucminas.pinkgo.entity.StatusPedido.APROVADO,
						br.pucminas.pinkgo.entity.StatusPedido.CONTRATO_EM_EXECUCAO)
					and p.dataRetirada <= :fimComPreparo and p.dataEntrega >= :inicioComPreparo)
				or (p.status = br.pucminas.pinkgo.entity.StatusPedido.CONTRATO_ENCERRADO
					and p.dataEntrega >= :inicioComPreparo and p.dataEntrega < :entrega)
			)
			""";

	private Disponibilidade() {
	}

	public static LocalDate inicioComPreparo(LocalDate retirada) {
		return retirada.minusDays(DIAS_PREPARACAO);
	}

	public static LocalDate fimComPreparo(LocalDate entrega) {
		return entrega.plusDays(DIAS_PREPARACAO);
	}
}
