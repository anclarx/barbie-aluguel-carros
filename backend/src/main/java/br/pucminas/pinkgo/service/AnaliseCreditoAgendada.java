package br.pucminas.pinkgo.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * De poucos em poucos segundos, pede aos bancos a resposta das propostas que já esperaram o tempo deles. Os testes
 * desligam (`pinkgo.bancos.analise-automatica=false`) e chamam o serviço direto.
 */
@Component
@ConditionalOnProperty(name = "pinkgo.bancos.analise-automatica", havingValue = "true", matchIfMissing = true)
public class AnaliseCreditoAgendada {

	private final AnaliseCreditoService analiseCredito;

	public AnaliseCreditoAgendada(AnaliseCreditoService analiseCredito) {
		this.analiseCredito = analiseCredito;
	}

	@Scheduled(fixedDelayString = "${pinkgo.bancos.intervalo:5s}", initialDelayString = "${pinkgo.bancos.intervalo:5s}")
	public void responder() {
		analiseCredito.responderPendentes();
	}
}
