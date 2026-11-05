package br.pucminas.pinkgo.service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucminas.pinkgo.dto.PaginaResponse;
import br.pucminas.pinkgo.dto.PedidoEdicaoRequest;
import br.pucminas.pinkgo.dto.PedidoRequest;
import br.pucminas.pinkgo.dto.PedidoResponse;
import br.pucminas.pinkgo.dto.PropostaRequest;
import br.pucminas.pinkgo.dto.ResumoPedidosResponse;
import br.pucminas.pinkgo.entity.Automovel;
import br.pucminas.pinkgo.entity.Banco;
import br.pucminas.pinkgo.entity.Cliente;
import br.pucminas.pinkgo.entity.Local;
import br.pucminas.pinkgo.entity.Pedido;
import br.pucminas.pinkgo.entity.StatusPedido;
import br.pucminas.pinkgo.exception.RecursoNaoEncontradoException;
import br.pucminas.pinkgo.exception.RegraDeNegocioException;
import br.pucminas.pinkgo.repository.AutomovelRepository;
import br.pucminas.pinkgo.repository.BancoRepository;
import br.pucminas.pinkgo.repository.ClienteRepository;
import br.pucminas.pinkgo.repository.LocalRepository;
import br.pucminas.pinkgo.repository.ModeloRepository;
import br.pucminas.pinkgo.repository.PedidoRepository;

@Service
@Transactional
public class PedidoService {

	private static final int TAMANHO_MAXIMO = 50;
	private static final Long SEM_PEDIDO = 0L;
	private static final Sort MAIS_RECENTES = Sort.by(Sort.Order.desc("dataSolicitacao"), Sort.Order.desc("id"));

	private final PedidoRepository pedidoRepository;
	private final ClienteRepository clienteRepository;
	private final ModeloRepository modeloRepository;
	private final AutomovelRepository automovelRepository;
	private final LocalRepository localRepository;
	private final BancoRepository bancoRepository;
	private final Clock clock;

	public PedidoService(PedidoRepository pedidoRepository, ClienteRepository clienteRepository,
			ModeloRepository modeloRepository, AutomovelRepository automovelRepository, LocalRepository localRepository,
			BancoRepository bancoRepository, Clock clock) {
		this.pedidoRepository = pedidoRepository;
		this.clienteRepository = clienteRepository;
		this.modeloRepository = modeloRepository;
		this.automovelRepository = automovelRepository;
		this.localRepository = localRepository;
		this.bancoRepository = bancoRepository;
		this.clock = clock;
	}

	public PedidoResponse criar(Long clienteId, PedidoRequest req) {
		validarPeriodo(req.dataRetirada(), req.dataEntrega());
		Cliente cliente = clienteRepository.findById(clienteId)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado."));
		if (!modeloRepository.existsById(req.modeloId()))
			throw new RecursoNaoEncontradoException("Modelo não encontrado.");

		Local localRetirada = req.localRetiradaId() == null ? null : local(req.localRetiradaId());
		Automovel automovel = automovelLivre(req.modeloId(), localRetirada, req.dataRetirada(), req.dataEntrega(), null,
				"modeloId");

		Local retirada = localRetirada != null ? localRetirada : automovel.getLocal();
		Local devolucao = req.localDevolucaoId() != null ? local(req.localDevolucaoId()) : retirada;
		Map<Banco, Integer> propostas = escolhasDeCredito(req.comCredito(), req.propostas());
		Pedido pedido = Pedido.criar(cliente, automovel, retirada, devolucao, req.dataRetirada(), req.dataEntrega(),
				req.comCredito(), hoje());
		pedido.definirPropostas(propostas);
		return PedidoResponse.de(pedidoRepository.save(pedido));
	}

	@Transactional(readOnly = true)
	public PaginaResponse<PedidoResponse> listar(Long clienteId, Collection<StatusPedido> status, int pagina,
			int tamanho) {
		Pageable pageable = PageRequest.of(Math.max(pagina, 1) - 1, Math.clamp(tamanho, 1, TAMANHO_MAXIMO),
				MAIS_RECENTES);
		Page<Pedido> page = status == null || status.isEmpty()
				? pedidoRepository.findByClienteId(clienteId, pageable)
				: pedidoRepository.findByClienteIdAndStatusIn(clienteId, status, pageable);
		return PaginaResponse.de(page, PedidoResponse::de);
	}

	@Transactional(readOnly = true)
	public ResumoPedidosResponse resumo(Long clienteId) {
		Map<StatusPedido, Long> porStatus = new EnumMap<>(StatusPedido.class);
		for (StatusPedido s : StatusPedido.values()) porStatus.put(s, 0L);
		pedidoRepository.contarPorStatus(clienteId).forEach(c -> porStatus.put(c.getStatus(), c.getTotal()));
		long total = porStatus.values().stream().mapToLong(Long::longValue).sum();
		return new ResumoPedidosResponse(total, porStatus);
	}

	@Transactional(readOnly = true)
	public PedidoResponse buscar(Long clienteId, Long pedidoId) {
		return PedidoResponse.de(pedidoDoCliente(clienteId, pedidoId));
	}

	public PedidoResponse editar(Long clienteId, Long pedidoId, PedidoEdicaoRequest req) {
		validarPeriodo(req.dataRetirada(), req.dataEntrega());
		Pedido pedido = pedidoDoCliente(clienteId, pedidoId);
		pedido.exigirModificavel("editado");
		Map<Banco, Integer> propostas = escolhasDeCredito(req.comCredito(), req.propostas());

		Local loja = req.localRetiradaId() == null ? pedido.getLocalRetirada() : local(req.localRetiradaId());
		Automovel automovel = automovelLivre(pedido.getModelo().getId(), loja, req.dataRetirada(), req.dataEntrega(),
				pedido, "localRetiradaId");
		pedido.trocarRetirada(loja, automovel);
		if (req.localDevolucaoId() != null && !req.localDevolucaoId().equals(pedido.getLocalDevolucao().getId()))
			pedido.trocarDevolucao(local(req.localDevolucaoId()));

		pedido.alterar(req.dataRetirada(), req.dataEntrega(), req.comCredito());
		pedido.definirPropostas(propostas);
		return PedidoResponse.de(pedido);
	}

	private Map<Banco, Integer> escolhasDeCredito(boolean comCredito, List<PropostaRequest> propostas) {
		if (!comCredito) return Map.of();
		if (propostas == null || propostas.isEmpty())
			throw new RegraDeNegocioException("propostas", "Escolha pelo menos um banco para o crédito.");
		Map<Banco, Integer> escolhas = new LinkedHashMap<>();
		Set<Long> vistos = new HashSet<>();
		for (PropostaRequest p : propostas) {
			if (!vistos.add(p.bancoId())) throw new RegraDeNegocioException("propostas", "Cada banco só pode ser escolhido uma vez.");
			Banco banco = bancoRepository.findById(p.bancoId())
					.orElseThrow(() -> new RecursoNaoEncontradoException("Banco não encontrado."));
			if (!banco.aceitaParcelas(p.parcelas()))
				throw new RegraDeNegocioException("propostas",
						banco.getNome() + " parcela em " + banco.opcoesParcelas().stream().map(n -> n + "x").toList() + ".");
			escolhas.put(banco, p.parcelas());
		}
		return escolhas;
	}

	public PedidoResponse escolherFinanciamento(Long clienteId, Long pedidoId, Long bancoId) {
		Pedido pedido = pedidoDoCliente(clienteId, pedidoId);
		pedido.escolherFinanciamento(bancoId);
		return PedidoResponse.de(pedido);
	}

	public PedidoResponse desistirDoFinanciamento(Long clienteId, Long pedidoId) {
		Pedido pedido = pedidoDoCliente(clienteId, pedidoId);
		pedido.desistirDoFinanciamento();
		return PedidoResponse.de(pedido);
	}

	public PedidoResponse cancelar(Long clienteId, Long pedidoId) {
		Pedido pedido = pedidoDoCliente(clienteId, pedidoId);
		pedido.cancelar();
		return PedidoResponse.de(pedido);
	}

	private Automovel automovelLivre(Long modeloId, Local loja, LocalDate retirada, LocalDate entrega,
			Pedido emEdicao, String campo) {
		List<Automovel> candidatos = loja == null ? automovelRepository.travarDoModelo(modeloId)
				: automovelRepository.travarDoModeloNoLocal(modeloId, loja.getId());
		Long ignorar = emEdicao == null ? SEM_PEDIDO : emEdicao.getId();
		Automovel atual = emEdicao == null ? null : emEdicao.getAutomovel();
		return candidatos.stream()
				.sorted(Comparator.comparing((Automovel a) -> a != atual))
				.filter(a -> !pedidoRepository.automovelOcupado(a.getId(), retirada, entrega, ignorar))
				.findFirst()
				.orElseThrow(() -> new RegraDeNegocioException(campo, "Não há automóvel deste modelo livre"
						+ (loja == null ? "" : " em " + loja.getDescricao()) + " nesse período."));
	}

	private void validarPeriodo(LocalDate retirada, LocalDate entrega) {
		if (retirada.isBefore(hoje().plusDays(1)))
			throw new RegraDeNegocioException("dataRetirada", "A retirada precisa ser a partir de amanhã.");
		if (entrega.isBefore(retirada.plusDays(1)))
			throw new RegraDeNegocioException("dataEntrega", "A entrega precisa ser pelo menos 1 dia depois da retirada.");
	}

	private Pedido pedidoDoCliente(Long clienteId, Long pedidoId) {
		return pedidoRepository.findById(pedidoId)
				.filter(p -> p.pertenceA(clienteId))
				.orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado."));
	}

	private Local local(Long id) {
		return localRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Local não encontrado."));
	}

	private LocalDate hoje() {
		return LocalDate.now(clock);
	}
}
