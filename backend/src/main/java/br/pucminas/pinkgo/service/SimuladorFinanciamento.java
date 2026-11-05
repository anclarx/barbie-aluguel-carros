package br.pucminas.pinkgo.service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

import br.pucminas.pinkgo.entity.Banco;

public final class SimuladorFinanciamento {

	private static final MathContext PRECISAO = MathContext.DECIMAL64;
	private static final BigDecimal CEM = BigDecimal.valueOf(100);

	public record Simulacao(BigDecimal entrada, BigDecimal valorFinanciado, int parcelas, BigDecimal valorParcela,
			BigDecimal totalJuros, BigDecimal totalComFinanciamento) {
	}

	private SimuladorFinanciamento() {
	}

	public static Simulacao simular(BigDecimal totalAluguel, Banco banco, int parcelas) {
		BigDecimal entrada = dinheiro(totalAluguel.multiply(banco.getEntradaMinima()).divide(CEM, PRECISAO));
		BigDecimal financiado = totalAluguel.subtract(entrada);
		BigDecimal i = banco.getJurosMensal().divide(CEM, PRECISAO);

		BigDecimal parcela;
		if (i.signum() == 0) {
			parcela = dinheiro(financiado.divide(BigDecimal.valueOf(parcelas), PRECISAO));
		} else {
			BigDecimal fator = BigDecimal.ONE.add(i).pow(parcelas, PRECISAO);
			parcela = dinheiro(financiado.multiply(i).multiply(fator).divide(fator.subtract(BigDecimal.ONE), PRECISAO));
		}

		BigDecimal totalParcelas = parcela.multiply(BigDecimal.valueOf(parcelas));
		return new Simulacao(entrada, financiado, parcelas, parcela, totalParcelas.subtract(financiado),
				entrada.add(totalParcelas));
	}

	private static BigDecimal dinheiro(BigDecimal valor) {
		return valor.setScale(2, RoundingMode.HALF_EVEN);
	}
}
