package br.pucminas.pinkgo.config;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import br.pucminas.pinkgo.entity.Agente;
import br.pucminas.pinkgo.entity.Automovel;
import br.pucminas.pinkgo.entity.Banco;
import br.pucminas.pinkgo.entity.Cliente;
import br.pucminas.pinkgo.entity.Local;
import br.pucminas.pinkgo.entity.Pedido;
import br.pucminas.pinkgo.entity.PropostaCredito;
import br.pucminas.pinkgo.entity.Rendimento;
import br.pucminas.pinkgo.entity.StatusPedido;
import br.pucminas.pinkgo.entity.TipoContrato;
import br.pucminas.pinkgo.entity.TipoRendimento;
import br.pucminas.pinkgo.repository.AgenteRepository;
import br.pucminas.pinkgo.repository.AutomovelRepository;
import br.pucminas.pinkgo.repository.BancoRepository;
import br.pucminas.pinkgo.repository.ClienteRepository;
import br.pucminas.pinkgo.repository.LocalRepository;
import br.pucminas.pinkgo.repository.PedidoRepository;
import br.pucminas.pinkgo.service.AnaliseCreditoService;
import br.pucminas.pinkgo.validation.CpfValidator;
import br.pucminas.pinkgo.validation.Documentos;
import tools.jackson.databind.json.JsonMapper;

@Component
@Order(2)
public class CargaDadosIniciais implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(CargaDadosIniciais.class);
	private static final JsonMapper JSON = JsonMapper.builder().build();
	private static final CpfValidator CPF = new CpfValidator();

	public record Dados(List<AgenteJson> agentes, List<ClienteJson> clientes) {
		public Dados {
			agentes = agentes == null ? List.of() : agentes;
			clientes = clientes == null ? List.of() : clientes;
		}
	}

	public record AgenteJson(String nome, String email, String senha) {
	}

	public record ClienteJson(String nome, String email, String senha, String cpf, String rg, String endereco,
			String profissao, List<RendimentoJson> rendimentos, List<PedidoJson> pedidos) {
	}

	public record RendimentoJson(TipoRendimento tipo, String entidadeEmpregadora, BigDecimal valorMensal) {
	}

	public record PedidoJson(String modelo, String lojaRetirada, String lojaDevolucao, LocalDate retirada,
			LocalDate entrega, LocalDate solicitadoEm, CreditoJson credito, StatusPedido status,
			TipoContrato tipoContrato, String justificativa) {
	}

	public record CreditoJson(List<PropostaJson> propostas, String bancoEscolhido) {
	}

	public record PropostaJson(String banco, int parcelas, Boolean aprovada, String motivo) {
	}

	private final Resource arquivo;
	private final ClienteRepository clienteRepository;
	private final AgenteRepository agenteRepository;
	private final PedidoRepository pedidoRepository;
	private final AutomovelRepository automovelRepository;
	private final LocalRepository localRepository;
	private final BancoRepository bancoRepository;
	private final PasswordEncoder passwordEncoder;
	private final TransactionTemplate transacao;
	private final Clock clock;

	public CargaDadosIniciais(@Value("${pinkgo.carga.arquivo}") Resource arquivo,
			ClienteRepository clienteRepository, AgenteRepository agenteRepository, PedidoRepository pedidoRepository,
			AutomovelRepository automovelRepository, LocalRepository localRepository, BancoRepository bancoRepository,
			PasswordEncoder passwordEncoder, TransactionTemplate transacao, Clock clock) {
		this.arquivo = arquivo;
		this.clienteRepository = clienteRepository;
		this.agenteRepository = agenteRepository;
		this.pedidoRepository = pedidoRepository;
		this.automovelRepository = automovelRepository;
		this.localRepository = localRepository;
		this.bancoRepository = bancoRepository;
		this.passwordEncoder = passwordEncoder;
		this.transacao = transacao;
		this.clock = clock;
	}

	@Override
	public void run(ApplicationArguments args) throws IOException {
		if (!arquivo.exists()) {
			log.info("Dados iniciais: {} não encontrado, nada a carregar.", arquivo.getDescription());
			return;
		}
		try (InputStream in = arquivo.getInputStream()) {
			carregar(JSON.readValue(in, Dados.class));
		}
	}

	public static Dados ler(String json) {
		return JSON.readValue(json, Dados.class);
	}

	public int carregar(Dados dados) {
		dados.agentes().forEach(a -> registrar("agente " + a.email(), () -> criarAgente(a)));
		int novos = 0;
		for (ClienteJson c : dados.clientes())
			if (registrar("cliente " + c.email(), () -> criarCliente(c))) novos++;
		if (novos > 0) log.info("Dados iniciais: {} clientes carregados com seus pedidos.", novos);
		return novos;
	}

	private boolean registrar(String oque, java.util.function.BooleanSupplier criar) {
		try {
			return Boolean.TRUE.equals(transacao.execute(s -> criar.getAsBoolean()));
		} catch (RuntimeException e) {
			log.warn("Dados iniciais: {} ignorado: {}", oque, e.getMessage());
			return false;
		}
	}

	private boolean criarAgente(AgenteJson a) {
		if (agenteRepository.existsByEmailIgnoreCase(a.email())) return false;
		agenteRepository.save(Agente.daEmpresa(a.nome(), a.email().trim().toLowerCase(), passwordEncoder.encode(a.senha())));
		log.info("Dados iniciais: agente {} criado.", a.email());
		return true;
	}

	private boolean criarCliente(ClienteJson c) {
		if (clienteRepository.existsByEmailIgnoreCase(c.email())) return false;
		String cpf = Documentos.cpf(c.cpf());
		String rg = Documentos.rg(c.rg());
		if (!CPF.isValid(cpf, null) || cpf.isEmpty()) throw new IllegalArgumentException("CPF inválido: " + c.cpf());
		if (clienteRepository.existsByCpf(cpf)) throw new IllegalArgumentException("CPF já cadastrado: " + c.cpf());
		if (clienteRepository.existsByRg(rg)) throw new IllegalArgumentException("RG já cadastrado: " + c.rg());

		Cliente cliente = new Cliente(c.nome(), cpf, rg, c.endereco(), c.profissao(), c.email().trim().toLowerCase(),
				passwordEncoder.encode(c.senha()));
		cliente.definirRendimentos(Optional.ofNullable(c.rendimentos()).orElse(List.of()).stream()
				.map(r -> new Rendimento(r.tipo(), r.entidadeEmpregadora(), r.valorMensal())).toList());
		clienteRepository.save(cliente);

		for (PedidoJson p : Optional.ofNullable(c.pedidos()).orElse(List.of())) {
			try {
				pedidoRepository.saveAndFlush(criarPedido(cliente, p));
			} catch (RuntimeException e) {
				log.warn("Dados iniciais: pedido de {} ({} em {}) ignorado: {}", c.email(), p.modelo(), p.retirada(),
						e.getMessage());
			}
		}
		return true;
	}

	private Pedido criarPedido(Cliente cliente, PedidoJson p) {
		Local retirada = loja(p.lojaRetirada());
		Local devolucao = p.lojaDevolucao() == null ? retirada : loja(p.lojaDevolucao());
		Automovel automovel = automovelRepository.findAll(Sort.by("id")).stream()
				.filter(a -> a.getModelo().getNome().equalsIgnoreCase(p.modelo())
						&& a.getLocal().getId().equals(retirada.getId()))
				.filter(a -> !pedidoRepository.automovelOcupado(a.getId(), p.retirada(), p.entrega(), 0L))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("nenhum " + p.modelo() + " livre em "
						+ retirada.getBairro() + " de " + p.retirada() + " a " + p.entrega()));

		LocalDate solicitadoEm = p.solicitadoEm() != null ? p.solicitadoEm() : LocalDate.now(clock);
		Pedido pedido = Pedido.criar(cliente, automovel, retirada, devolucao, p.retirada(), p.entrega(),
				p.credito() != null, solicitadoEm);

		if (p.credito() != null) {
			Map<Banco, Integer> parcelas = new LinkedHashMap<>();
			p.credito().propostas().forEach(pr -> parcelas.put(banco(pr.banco()), pr.parcelas()));
			pedido.definirPropostas(parcelas);
			boolean jaAnalisado = p.status() != null && p.status() != StatusPedido.EM_ANALISE_FINANCEIRA;
			for (PropostaJson pr : p.credito().propostas()) {
				PropostaCredito proposta = pedido.getPropostas().stream()
						.filter(x -> x.getBanco().getNome().equalsIgnoreCase(pr.banco())).findFirst().orElseThrow();
				if (pr.aprovada() != null) {
					proposta.responder(pr.aprovada(), pr.motivo() != null ? pr.motivo()
							: pr.aprovada() ? "Aprovada pela política do banco." : "Negada pela política do banco.");
				} else if (jaAnalisado) {
					var resultado = AnaliseCreditoService.avaliar(proposta);
					proposta.responder(resultado.aprovada(), resultado.motivo());
				}
			}
			if (p.credito().bancoEscolhido() != null)
				pedido.escolherFinanciamento(banco(p.credito().bancoEscolhido()).getId());
		}

		StatusPedido status = p.status() == null ? StatusPedido.EM_ANALISE_FINANCEIRA : p.status();
		switch (status) {
			case EM_ANALISE_FINANCEIRA -> {
			}
			case CANCELADO -> pedido.cancelar();
			case NEGADO -> pedido.negar(p.justificativa());
			case APROVADO -> pedido.aprovar(p.justificativa(), p.tipoContrato());
			case CONTRATO_EM_EXECUCAO -> {
				pedido.aprovar(p.justificativa(), p.tipoContrato());
				pedido.iniciarContrato();
			}
			case CONTRATO_ENCERRADO -> {
				pedido.aprovar(p.justificativa(), p.tipoContrato());
				pedido.iniciarContrato();
				pedido.encerrarContrato();
			}
		}
		return pedido;
	}

	private Local loja(String nome) {
		return localRepository.findAll().stream()
				.filter(l -> l.getBairro().equalsIgnoreCase(nome) || l.getCidade().equalsIgnoreCase(nome))
				.findFirst().orElseThrow(() -> new IllegalArgumentException("loja não encontrada: " + nome));
	}

	private Banco banco(String nome) {
		return bancoRepository.findAll().stream().filter(b -> b.getNome().equalsIgnoreCase(nome)).findFirst()
				.orElseThrow(() -> new IllegalArgumentException("banco não encontrado: " + nome));
	}
}
