package br.pucminas.pinkgo.dto;

import br.pucminas.pinkgo.entity.PropostaCredito;
import br.pucminas.pinkgo.entity.StatusProposta;
import br.pucminas.pinkgo.service.SimuladorFinanciamento;
import br.pucminas.pinkgo.service.SimuladorFinanciamento.Simulacao;

public record PropostaResponse(Long id, BancoResponse banco, int parcelas, StatusProposta status, Simulacao simulacao,
		String motivo, boolean escolhida) {

	public static PropostaResponse de(PropostaCredito p) {
		return new PropostaResponse(p.getId(), BancoResponse.de(p.getBanco()), p.getParcelas(), p.getStatus(),
				SimuladorFinanciamento.simular(p.getPedido().getTotalEstimado(), p.getBanco(), p.getParcelas()),
				p.getMotivo(), p.escolhida());
	}
}
