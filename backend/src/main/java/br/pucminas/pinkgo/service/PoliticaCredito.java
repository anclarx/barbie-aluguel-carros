package br.pucminas.pinkgo.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Set;

import br.pucminas.pinkgo.entity.Banco;
import br.pucminas.pinkgo.entity.Rendimento;
import br.pucminas.pinkgo.entity.TipoRendimento;
import br.pucminas.pinkgo.service.SimuladorFinanciamento.Simulacao;

public record PoliticaCredito(BigDecimal rendaMinima, BigDecimal comprometimentoMax, BigDecimal financiamentoMax,
		Set<TipoRendimento> rendasAceitas) {

	public record Resultado(boolean aprovada, String motivo) {
	}

	private static final BigDecimal CEM = BigDecimal.valueOf(100);

	static final PoliticaCredito AURORA = new PoliticaCredito(new BigDecimal("5000"), new BigDecimal("30"),
			new BigDecimal("30000"), Set.of());
	static final PoliticaCredito CELESTE = new PoliticaCredito(new BigDecimal("3000"), new BigDecimal("35"),
			new BigDecimal("15000"), Set.of(TipoRendimento.EMPREGO_CLT_PUBLICO, TipoRendimento.APOSENTADORIA));
	static final PoliticaCredito BRILHO = new PoliticaCredito(new BigDecimal("2000"), new BigDecimal("40"),
			new BigDecimal("50000"), Set.of());

	public static PoliticaCredito de(Banco banco) {
		return switch (banco.getNome()) {
			case "Banco Aurora" -> AURORA;
			case "Banco Celeste" -> CELESTE;
			default -> BRILHO;
		};
	}

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
