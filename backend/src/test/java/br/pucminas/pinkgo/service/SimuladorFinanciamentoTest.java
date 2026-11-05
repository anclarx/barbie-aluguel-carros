package br.pucminas.pinkgo.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

import br.pucminas.pinkgo.entity.Banco;
import br.pucminas.pinkgo.service.SimuladorFinanciamento.Simulacao;

class SimuladorFinanciamentoTest {

	private static final BigDecimal TOTAL = new BigDecimal("22000.00");

	@Test
	void simulaComTabelaPrice() {
		Banco banco = new Banco("Banco Aurora", new BigDecimal("1.49"), 18, new BigDecimal("10"));

		Simulacao s = SimuladorFinanciamento.simular(TOTAL, banco, 18);

		assertThat(s.entrada()).isEqualByComparingTo("2200.00");
		assertThat(s.valorFinanciado()).isEqualByComparingTo("19800.00");
		assertThat(s.valorParcela()).isEqualByComparingTo("1262.22");
		assertThat(s.totalJuros()).isEqualByComparingTo("2919.96");
		assertThat(s.totalComFinanciamento()).isEqualByComparingTo("24919.96");
	}

	@Test
	void outroBancoOutrosJuros() {
		Banco banco = new Banco("Banco Brilho", new BigDecimal("1.79"), 18, new BigDecimal("10"));

		assertThat(SimuladorFinanciamento.simular(TOTAL, banco, 18).valorParcela()).isEqualByComparingTo("1296.44");
	}

	@Test
	void semJurosDivideOSaldo() {
		Banco banco = new Banco("Banco Zero", BigDecimal.ZERO, 12, new BigDecimal("20"));

		Simulacao s = SimuladorFinanciamento.simular(TOTAL, banco, 12);

		assertThat(s.valorParcela()).isEqualByComparingTo("1466.67");
		assertThat(s.entrada()).isEqualByComparingTo("4400.00");
	}

	@Test
	void parcelamentoAndaDe6Em6AteOMaximo() {
		assertThat(new Banco("A", BigDecimal.ONE, 18, BigDecimal.TEN).opcoesParcelas()).containsExactly(6, 12, 18);
		assertThat(new Banco("B", BigDecimal.ONE, 12, BigDecimal.TEN).aceitaParcelas(18)).isFalse();
	}
}
