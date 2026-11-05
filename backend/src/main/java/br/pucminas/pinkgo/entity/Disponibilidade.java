package br.pucminas.pinkgo.entity;

import java.time.LocalDate;

/**
 * Regra de disponibilidade e reserva de veículos.
 *
 * <p>O cliente reserva um modelo, não um carro: a reserva é possível se pelo menos um automóvel do modelo atende o
 * período inteiro. Cada locação bloqueia o carro por {@value #DIAS_PREPARACAO} dias antes da retirada e
 * {@value #DIAS_PREPARACAO} depois da devolução prevista, para limpeza e vistoria. A preparação é compartilhada entre
 * locações vizinhas: uma locação de 03/11 a 10/11 libera o carro para uma nova retirada a partir de 13/11, e não
 * 15/11.
 *
 * <table>
 * <tr><th>Status</th><th>Bloqueia o carro?</th></tr>
 * <tr><td>Em análise, aprovado, em execução</td><td>Sim, com a preparação antes e depois</td></tr>
 * <tr><td>Encerrado</td><td>Só a preparação depois da devolução prevista</td></tr>
 * <tr><td>Cancelado, negado</td><td>Não</td></tr>
 * </table>
 */
public final class Disponibilidade {

	public static final int DIAS_PREPARACAO = 2;

	/**
	 * JPQL: o pedido `p` impede uma nova locação de `:retirada` a `:entrega`. Os parâmetros `:inicioComPreparo` e
	 * `:fimComPreparo` são o período novo esticado pela preparação (veja {@link #inicioComPreparo} e
	 * {@link #fimComPreparo}): basta a preparação de um dos lados para cobrir o intervalo entre as duas locações.
	 */
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

	/** Primeiro dia que outra locação do mesmo carro não pode ocupar antes desta. */
	public static LocalDate inicioComPreparo(LocalDate retirada) {
		return retirada.minusDays(DIAS_PREPARACAO);
	}

	/** Último dia que outra locação do mesmo carro não pode ocupar depois desta. */
	public static LocalDate fimComPreparo(LocalDate entrega) {
		return entrega.plusDays(DIAS_PREPARACAO);
	}
}
