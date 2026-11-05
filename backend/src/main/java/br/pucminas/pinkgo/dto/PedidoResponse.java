package br.pucminas.pinkgo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import br.pucminas.pinkgo.entity.Automovel;
import br.pucminas.pinkgo.entity.Pedido;
import br.pucminas.pinkgo.entity.StatusPedido;
import br.pucminas.pinkgo.entity.TipoContrato;

public record PedidoResponse(Long id, String codigo, ModeloResponse modelo, AutomovelReservado automovel,
		LocalResponse localRetirada, LocalResponse localDevolucao, LocalDate dataSolicitacao, LocalDate dataRetirada,
		LocalDate dataEntrega, boolean comCredito, BigDecimal totalEstimado, StatusPedido status,
		TipoContrato tipoContrato, String bancoAssociado, List<PropostaResponse> propostas, String justificativaParecer,
		String pendenciaParaAprovar) {

	public record AutomovelReservado(Long id, String matricula, String placa) {

		static AutomovelReservado de(Automovel a) {
			return a == null ? null : new AutomovelReservado(a.getId(), a.getMatricula(), a.getPlaca());
		}
	}

	public static PedidoResponse de(Pedido p) {
		return new PedidoResponse(p.getId(), "P" + p.getId(), ModeloResponse.de(p.getModelo()),
				AutomovelReservado.de(p.getAutomovel()), LocalResponse.de(p.getLocalRetirada()),
				LocalResponse.de(p.getLocalDevolucao()), p.getDataSolicitacao(), p.getDataRetirada(), p.getDataEntrega(),
				p.isComCredito(), p.getTotalEstimado(), p.getStatus(), p.getTipoContrato(), p.getBancoAssociado(),
				p.getPropostas().stream().map(PropostaResponse::de).toList(), p.getJustificativaParecer(),
				p.getStatus() == StatusPedido.EM_ANALISE_FINANCEIRA ? p.pendenciaParaAprovar().orElse(null) : null);
	}
}
