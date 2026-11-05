package br.pucminas.pinkgo.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

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
