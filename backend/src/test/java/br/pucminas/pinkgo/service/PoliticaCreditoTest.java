package br.pucminas.pinkgo.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

import br.pucminas.pinkgo.entity.Rendimento;
import br.pucminas.pinkgo.entity.TipoRendimento;
import br.pucminas.pinkgo.service.SimuladorFinanciamento.Simulacao;

class PoliticaCreditoTest {

	private static Rendimento renda(TipoRendimento tipo, String valor) {
		return new Rendimento(tipo, "Fonte", new BigDecimal(valor));
	}

	private static Simulacao simulacao(String financiado, String parcela) {
		return new Simulacao(BigDecimal.ZERO, new BigDecimal(financiado), 12, new BigDecimal(parcela), BigDecimal.ZERO,
				BigDecimal.ZERO);
	}

	@Test
	void auroraExigeRendaDeCincoMil() {
		var resultado = PoliticaCredito.AURORA.avaliar(List.of(renda(TipoRendimento.AUTONOMO, "4000")),
				simulacao("1000", "100"));

		assertThat(resultado.aprovada()).isFalse();
		assertThat(resultado.motivo()).contains("R$ 5.000,00");
	}

	@Test
	void celesteSoContaRendaComVinculoFormal() {
		List<Rendimento> rendimentos = List.of(renda(TipoRendimento.EMPREGO_CLT_PUBLICO, "2000"),
				renda(TipoRendimento.AUTONOMO, "6000"));

		assertThat(PoliticaCredito.CELESTE.avaliar(rendimentos, simulacao("1000", "100")).aprovada()).isFalse();
		assertThat(PoliticaCredito.BRILHO.avaliar(rendimentos, simulacao("1000", "100")).aprovada()).isTrue();
	}

	@Test
	void parcelaNaoPodePassarDoComprometimentoMaximo() {
		List<Rendimento> rendimentos = List.of(renda(TipoRendimento.EMPREGO_CLT_PUBLICO, "10000"));

		assertThat(PoliticaCredito.AURORA.avaliar(rendimentos, simulacao("20000", "3000")).aprovada()).isTrue();
		var negada = PoliticaCredito.AURORA.avaliar(rendimentos, simulacao("20000", "3100"));
		assertThat(negada.aprovada()).isFalse();
		assertThat(negada.motivo()).contains("31%").contains("30%");
	}

	@Test
	void valorFinanciadoAcimaDoLimiteDoBanco() {
		List<Rendimento> rendimentos = List.of(renda(TipoRendimento.EMPREGO_CLT_PUBLICO, "50000"));

		assertThat(PoliticaCredito.CELESTE.avaliar(rendimentos, simulacao("15001", "100")).aprovada()).isFalse();
		assertThat(PoliticaCredito.BRILHO.avaliar(rendimentos, simulacao("15001", "100")).aprovada()).isTrue();
	}
}
