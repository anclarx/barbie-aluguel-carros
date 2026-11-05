package br.pucminas.pinkgo.service;

import java.util.Collection;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucminas.pinkgo.dto.AgenteResponse;
import br.pucminas.pinkgo.dto.PaginaResponse;
import br.pucminas.pinkgo.dto.PedidoAgenteResponse;
import br.pucminas.pinkgo.dto.ResumoPedidosResponse;
import br.pucminas.pinkgo.entity.Agente;
import br.pucminas.pinkgo.entity.Pedido;
import br.pucminas.pinkgo.entity.StatusPedido;
import br.pucminas.pinkgo.entity.TipoContrato;
import br.pucminas.pinkgo.exception.RecursoNaoEncontradoException;
import br.pucminas.pinkgo.repository.AgenteRepository;
import br.pucminas.pinkgo.repository.PedidoRepository;
import br.pucminas.pinkgo.repository.PedidoRepository.ContagemPorStatus;

/**
 * Painel do agente da PinkGo: todos os pedidos, o parecer da análise financeira e o contrato. Os bancos não têm
 * agente; respondem sozinhos às propostas (AnaliseCreditoService).
 */
@Service
@Transactional(readOnly = true)
public class AgenteService {

	private static final int TAMANHO_MAXIMO = 50;
	private static final Sort MAIS_RECENTES = Sort.by(Sort.Order.desc("dataSolicitacao"), Sort.Order.desc("id"));

	private final AgenteRepository agenteRepository;
	private final PedidoRepository pedidoRepository;

	public AgenteService(AgenteRepository agenteRepository, PedidoRepository pedidoRepository) {
		this.agenteRepository = agenteRepository;
		this.pedidoRepository = pedidoRepository;
	}

	public AgenteResponse buscar(Long id) {
		return AgenteResponse.de(agente(id));
	}

	/** `pagina` começa em 1. Sem `status`, traz todos. */
	public PaginaResponse<PedidoAgenteResponse> listarPedidos(Long agenteId, Collection<StatusPedido> status,
			int pagina, int tamanho) {
		agente(agenteId);
		Pageable pageable = PageRequest.of(Math.max(pagina, 1) - 1, Math.clamp(tamanho, 1, TAMANHO_MAXIMO),
				MAIS_RECENTES);
		boolean todos = status == null || status.isEmpty();
		Collection<StatusPedido> filtro = todos ? List.of(StatusPedido.values()) : status;
		Page<Pedido> page = pedidoRepository.findParaEmpresa(todos, filtro, pageable);
		return PaginaResponse.de(page, PedidoAgenteResponse::de);
	}

	public ResumoPedidosResponse resumo(Long agenteId) {
		agente(agenteId);
		List<ContagemPorStatus> contagens = pedidoRepository.contarTodosPorStatus();
		Map<StatusPedido, Long> porStatus = new EnumMap<>(StatusPedido.class);
		for (StatusPedido s : StatusPedido.values()) porStatus.put(s, 0L);
		contagens.forEach(c -> porStatus.put(c.getStatus(), c.getTotal()));
		long total = porStatus.values().stream().mapToLong(Long::longValue).sum();
		return new ResumoPedidosResponse(total, porStatus);
	}

	/* Parecer da análise financeira e contrato. */

	@Transactional
	public PedidoAgenteResponse aprovar(Long pedidoId, String justificativa, TipoContrato tipoContrato) {
		return agir(pedidoId, p -> p.aprovar(justificativa, tipoContrato));
	}

	@Transactional
	public PedidoAgenteResponse negar(Long pedidoId, String justificativa) {
		return agir(pedidoId, p -> p.negar(justificativa));
	}

	@Transactional
	public PedidoAgenteResponse iniciarContrato(Long pedidoId) {
		return agir(pedidoId, Pedido::iniciarContrato);
	}

	@Transactional
	public PedidoAgenteResponse encerrarContrato(Long pedidoId) {
		return agir(pedidoId, Pedido::encerrarContrato);
	}

	private PedidoAgenteResponse agir(Long pedidoId, Consumer<Pedido> acao) {
		Pedido pedido = pedido(pedidoId);
		acao.accept(pedido);
		return PedidoAgenteResponse.de(pedido);
	}

	private Pedido pedido(Long id) {
		return pedidoRepository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado."));
	}

	private Agente agente(Long id) {
		return agenteRepository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Agente não encontrado."));
	}
}
