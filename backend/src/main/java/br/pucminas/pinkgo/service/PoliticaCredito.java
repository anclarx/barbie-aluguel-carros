package br.pucminas.pinkgo.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Set;

import br.pucminas.pinkgo.entity.Banco;
import br.pucminas.pinkgo.entity.Rendimento;
import br.pucminas.pinkgo.entity.TipoRendimento;
import br.pucminas.pinkgo.service.SimuladorFinanciamento.Simulacao;

/**
 * Pré-requisitos de cada banco parceiro para aprovar o crédito do aluguel. A resposta sai sozinha, sem agente do
 * banco: o banco olha a renda do cliente e a simulação da proposta.
 *
 * @param rendaMinima          renda mensal mínima do cliente, somando os rendimentos que o banco aceita
 * @param comprometimentoMax   quanto da renda a parcela pode ocupar, em %
 * @param financiamentoMax     maior valor financiado (total do aluguel menos a entrada)
 * @param rendasAceitas        tipos de rendimento que o banco considera; vazio aceita todos
 */
public record PoliticaCredito(BigDecimal rendaMinima, BigDecimal comprometimentoMax, BigDecimal financiamentoMax,
		Set<TipoRendimento> rendasAceitas) {

	/** Resposta do banco: aprovado ou não, e o motivo para mostrar ao cliente e ao agente. */
	public record Resultado(boolean aprovada, String motivo) {
	}

	private static final BigDecimal CEM = BigDecimal.valueOf(100);

	/** Aurora: juros baixos, mas exigente com a renda. */
	static final PoliticaCredito AURORA = new PoliticaCredito(new BigDecimal("5000"), new BigDecimal("30"),
			new BigDecimal("30000"), Set.of());
	/** Celeste: só conta renda com vínculo formal (CLT, servidor ou aposentadoria) e financia valores menores. */
	static final PoliticaCredito CELESTE = new PoliticaCredito(new BigDecimal("3000"), new BigDecimal("35"),
			new BigDecimal("15000"), Set.of(TipoRendimento.EMPREGO_CLT_PUBLICO, TipoRendimento.APOSENTADORIA));
	/** Brilho: o mais flexível, com os juros mais altos. Também vale para um banco novo sem política própria. */
	static final PoliticaCredito BRILHO = new PoliticaCredito(new BigDecimal("2000"), new BigDecimal("40"),
			new BigDecimal("50000"), Set.of());

	public static PoliticaCredito de(Banco banco) {
		return switch (banco.getNome()) {
			case "Banco Aurora" -> AURORA;
			case "Banco Celeste" -> CELESTE;
			default -> BRILHO;
		};
	}

	/** Os critérios são conferidos nesta ordem; o primeiro que falha é o motivo da recusa. */
	public Resultado avaliar(List<Rendimento> rendimentos, Simulacao simulacao) {
		BigDecimal renda = rendimentos.stream()
				.filter(r -> rendasAceitas.isEmpty() || rendasAceitas.contains(r.getTipo()))
				.map(Rendimento::getValorMensal)
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		if (renda.compareTo(rendaMinima) < 0)
			return new Resultado(false, rendasAceitas.isEmpty()
					? "Renda mensal abaixo do mínimo do banco (" + reais(rendaMinima) + ")."
					: "Renda com vínculo formal (CLT, servidor ou aposentadoria) abaixo do mínimo do banco ("
							+ reais(rendaMinima) + ").");
		if (simulacao.valorFinanciado().compareTo(financiamentoMax) > 0)
			return new Resultado(false, "Valor financiado acima do limite do banco (" + reais(financiamentoMax) + ").");
		BigDecimal comprometimento = simulacao.valorParcela().multiply(CEM).divide(renda, 1, RoundingMode.HALF_UP);
		if (comprometimento.compareTo(comprometimentoMax) > 0)
			return new Resultado(false, "A parcela ocuparia " + comprometimento.stripTrailingZeros().toPlainString()
					+ "% da renda; o banco aceita até " + comprometimentoMax.toPlainString() + "%.");
		return new Resultado(true, "Parcela de " + comprometimento.stripTrailingZeros().toPlainString()
				+ "% da renda, dentro da política do banco.");
	}

	private static String reais(BigDecimal valor) {
		return "R$ " + String.format(java.util.Locale.forLanguageTag("pt-BR"), "%,.2f", valor);
	}
}
