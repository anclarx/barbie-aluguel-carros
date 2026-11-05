package br.pucminas.pinkgo.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucminas.pinkgo.entity.PropostaCredito;
import br.pucminas.pinkgo.repository.PropostaCreditoRepository;
import br.pucminas.pinkgo.service.PoliticaCredito.Resultado;

@Service
public class AnaliseCreditoService {

	private static final Logger log = LoggerFactory.getLogger(AnaliseCreditoService.class);

	private final PropostaCreditoRepository propostaRepository;
	private final Clock clock;
	private final Duration tempoResposta;

	public AnaliseCreditoService(PropostaCreditoRepository propostaRepository, Clock clock,
			@Value("${pinkgo.bancos.tempo-resposta:30s}") Duration tempoResposta) {
		this.propostaRepository = propostaRepository;
		this.clock = clock;
		this.tempoResposta = tempoResposta;
	}

	@Transactional
	public int responderPendentes() {
		return responderPendentes(clock.instant());
	}

	@Transactional
	public int responderPendentes(Instant agora) {
		List<PropostaCredito> pendentes = propostaRepository.findAguardandoResposta(agora.minus(tempoResposta));
		for (PropostaCredito proposta : pendentes) {
			Resultado resultado = avaliar(proposta);
			proposta.responder(resultado.aprovada(), resultado.motivo());
			log.info("{} {} o crédito do pedido P{}: {}", proposta.getBanco().getNome(),
					resultado.aprovada() ? "aprovou" : "negou", proposta.getPedido().getId(), resultado.motivo());
		}
		return pendentes.size();
	}

	public static Resultado avaliar(PropostaCredito proposta) {
		var pedido = proposta.getPedido();
		var simulacao = SimuladorFinanciamento.simular(pedido.getTotalEstimado(), proposta.getBanco(),
				proposta.getParcelas());
		return PoliticaCredito.de(proposta.getBanco()).avaliar(pedido.getCliente().getRendimentos(), simulacao);
	}
}
