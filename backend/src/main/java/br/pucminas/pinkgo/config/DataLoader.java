package br.pucminas.pinkgo.config;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import br.pucminas.pinkgo.entity.Agente;
import br.pucminas.pinkgo.entity.Automovel;
import br.pucminas.pinkgo.entity.Banco;
import br.pucminas.pinkgo.entity.Cliente;
import br.pucminas.pinkgo.entity.Local;
import br.pucminas.pinkgo.entity.Modelo;
import br.pucminas.pinkgo.entity.Pedido;
import br.pucminas.pinkgo.entity.Rendimento;
import br.pucminas.pinkgo.entity.TipoRendimento;
import br.pucminas.pinkgo.repository.AgenteRepository;
import br.pucminas.pinkgo.repository.AutomovelRepository;
import br.pucminas.pinkgo.repository.BancoRepository;
import br.pucminas.pinkgo.repository.ClienteRepository;
import br.pucminas.pinkgo.repository.LocalRepository;
import br.pucminas.pinkgo.repository.ModeloRepository;
import br.pucminas.pinkgo.repository.PedidoRepository;

/**
 * Carga inicial (guia, seção 4): lojas e bancos quando o banco está vazio, o catálogo de modelos sempre igual à
 * lista daqui e os logins de teste (cliente e agentes) quando ainda não existem. Roda a cada subida sem duplicar nada.
 */
@Component
@Order(1)
public class DataLoader implements ApplicationRunner {

	/** Login do cliente de teste. */
	public static final String EMAIL_TESTE = "cliente@pinkgo.dev";
	public static final String SENHA_TESTE = "pinkgo123";
	/** Login do agente de teste da PinkGo. */
	public static final String EMAIL_AGENTE_EMPRESA = "agente@pinkgo.com";
	/** Endereço anterior do mesmo agente; quem já tinha o banco populado tem o login trocado na subida. */
	private static final String EMAIL_AGENTE_ANTIGO = "agente@pinkgo.dev";
	public static final String SENHA_AGENTES = "agente123";

	private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

	private final LocalRepository localRepository;
	private final ModeloRepository modeloRepository;
	private final AutomovelRepository automovelRepository;
	private final ClienteRepository clienteRepository;
	private final PedidoRepository pedidoRepository;
	private final BancoRepository bancoRepository;
	private final AgenteRepository agenteRepository;
	private final PasswordEncoder passwordEncoder;
	private final Clock clock;
	private final JdbcTemplate jdbc;

	public DataLoader(LocalRepository localRepository, ModeloRepository modeloRepository,
			AutomovelRepository automovelRepository, ClienteRepository clienteRepository,
			PedidoRepository pedidoRepository, BancoRepository bancoRepository, AgenteRepository agenteRepository,
			PasswordEncoder passwordEncoder, Clock clock, JdbcTemplate jdbc) {
		this.localRepository = localRepository;
		this.modeloRepository = modeloRepository;
		this.automovelRepository = automovelRepository;
		this.clienteRepository = clienteRepository;
		this.pedidoRepository = pedidoRepository;
		this.bancoRepository = bancoRepository;
		this.agenteRepository = agenteRepository;
		this.passwordEncoder = passwordEncoder;
		this.clock = clock;
		this.jdbc = jdbc;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		// Cada parte confere o que já existe, então rodar de novo não duplica nada.
		List<Local> locais = localRepository.count() == 0 ? criarLocais() : localRepository.findAll(Sort.by("id"));
		sincronizarModelos(locais);
		if (bancoRepository.count() == 0) criarBancos();
		List<Banco> bancos = bancoRepository.findAllByOrderByJurosMensalAscNomeAsc();
		criarAgentesDeTeste();
		if (!clienteRepository.existsByEmailIgnoreCase(EMAIL_TESTE)) criarClienteDeTeste(bancos);
	}

	private List<Local> criarLocais() {
		return localRepository.saveAll(List.of(
				new Local("Savassi", "Belo Horizonte", "MG"),
				new Local("Pinheiros", "São Paulo", "SP"),
				new Local("Setor Bueno", "Goiânia", "GO"),
				new Local("Aldeota", "Fortaleza", "CE")));
	}

	/** Bancos parceiros fictícios; juros ao mês e entrada mínima em %. */
	private void criarBancos() {
		bancoRepository.saveAll(List.of(
				new Banco("Banco Aurora", new BigDecimal("1.49"), 18, new BigDecimal("10")),
				new Banco("Banco Celeste", new BigDecimal("1.59"), 12, new BigDecimal("20")),
				new Banco("Banco Brilho", new BigDecimal("1.79"), 18, new BigDecimal("10"))));
		log.info("Carga inicial: bancos parceiros criados.");
	}

	/**
	 * O catálogo segue a lista de {@link #modelos()}, procurando cada modelo pelo nome: os que já existem recebem os
	 * dados e as fotos atuais (assim, trocar uma foto aqui chega ao banco sem apagar pedidos), e os novos entram com
	 * os seus automóveis.
	 */
	private void sincronizarModelos(List<Local> locais) {
		List<Modelo> catalogo = modelos();
		int novos = 0;
		for (int i = 0; i < catalogo.size(); i++) {
			Modelo dados = catalogo.get(i);
			var existente = modeloRepository.findByNome(dados.getNome());
			if (existente.isPresent()) {
				existente.get().atualizarCom(dados);
				continue;
			}
			Modelo modelo = modeloRepository.save(dados);
			automovelRepository.saveAll(frota(i, modelo, locais));
			novos++;
		}
		if (novos > 0) log.info("Carga inicial: {} modelos novos, com {} automóveis cada.", novos, AUTOMOVEIS_POR_MODELO);
	}

	/**
	 * Não há cadastro de agentes pelo site: o agente da PinkGo é fixo. Os bancos respondem sozinhos às propostas
	 * (AnaliseCreditoService) e não têm login.
	 */
	private void criarAgentesDeTeste() {
		removerAgentesDeBanco();
		if (agenteRepository.existsByEmailIgnoreCase(EMAIL_AGENTE_EMPRESA)) return;
		// O login fixo mudou de endereço: o agente antigo só troca de e-mail, sem criar outro.
		var antigo = agenteRepository.findByEmailIgnoreCase(EMAIL_AGENTE_ANTIGO);
		if (antigo.isPresent()) {
			antigo.get().trocarEmail(EMAIL_AGENTE_EMPRESA);
			log.info("Agente da PinkGo: e-mail trocado para {}.", EMAIL_AGENTE_EMPRESA);
			return;
		}
		agenteRepository.save(Agente.daEmpresa("Agente PinkGo", EMAIL_AGENTE_EMPRESA, passwordEncoder.encode(SENHA_AGENTES)));
		log.info("Agente de teste: {} / {}", EMAIL_AGENTE_EMPRESA, SENHA_AGENTES);
	}

	/**
	 * Bancos com login ficaram no passado: bancos que já tinham a tabela `agentes` com as colunas `tipo` e `banco_id`
	 * apagam os agentes de banco e as duas colunas. Num Supabase novo as colunas nem existem, e nada acontece.
	 */
	private void removerAgentesDeBanco() {
		jdbc.execute("""
				DO $$ BEGIN
				  IF EXISTS (SELECT 1 FROM information_schema.columns
				             WHERE table_name = 'agentes' AND column_name = 'tipo') THEN
				    DELETE FROM agentes WHERE tipo = 'BANCO';
				    ALTER TABLE agentes DROP COLUMN tipo;
				  END IF;
				END $$""");
		jdbc.execute("ALTER TABLE agentes DROP COLUMN IF EXISTS banco_id");
	}

	/** Cliente com dois rendimentos e um pedido com crédito, para "Meus aluguéis" não começar vazio. */
	private void criarClienteDeTeste(List<Banco> bancos) {
		Cliente cliente = new Cliente("Cliente de Teste", "52998224725", "123456789",
				"Rua das Flores, 1989, Belo Horizonte - MG", "Designer", EMAIL_TESTE, passwordEncoder.encode(SENHA_TESTE));
		cliente.definirRendimentos(List.of(
				new Rendimento(TipoRendimento.EMPREGO_CLT_PUBLICO, "Estúdio Rosa", new BigDecimal("8500.00")),
				new Rendimento(TipoRendimento.INVESTIMENTO, null, new BigDecimal("1200.00"))));
		clienteRepository.save(cliente);
		log.info("Cliente de teste: {} / {}", EMAIL_TESTE, SENHA_TESTE);

		LocalDate hoje = LocalDate.now(clock);
		LocalDate retirada = hoje.plusDays(10);
		LocalDate entrega = hoje.plusDays(13);
		// O primeiro carro livre nesses dias, respeitando a regra de disponibilidade.
		automovelRepository.findAll(Sort.by("id")).stream()
				.filter(a -> !pedidoRepository.automovelOcupado(a.getId(), retirada, entrega, 0L))
				.findFirst()
				.ifPresent(automovel -> {
					Pedido pedido = Pedido.criar(cliente, automovel, automovel.getLocal(), automovel.getLocal(),
							retirada, entrega, true, hoje);
					pedido.definirPropostas(Map.of(bancos.get(0), 18, bancos.get(bancos.size() - 1), 12));
					pedidoRepository.save(pedido);
				});
	}

	/**
	 * Os modelos da vitrine, cada um com duas variações de cor (a primeira é a foto principal). A ordem importa: a
	 * posição define as lojas e as placas dos automóveis, então modelos novos entram sempre no fim.
	 */
	private static List<Modelo> modelos() {
		return List.of(
				modelo("DreamMotors", "Pegasus Cabrio", 2024, "1000", "Câmbio automático", "Elétrico", 2, 2, "240 L",
						"Conversível", "pegasus-cabrio-perola.png", "pegasus-cabrio-rose.jpg"),
				modelo("Malibu Auto", "Sunset GT", 2023, "560", "Câmbio automático", "Flex", 2, 2, "300 L",
						"Conversível", "sunset-gt-pink.png", "sunset-gt-roxo.png"),
				modelo("Malibu Auto", "Lilac Spyder", 2021, "270", "Câmbio automático", "Flex", 2, 2, "300 L",
						"Esportivo", "lilac-spyder-lilas.png", "lilac-spyder-ciano.png"),
				modelo("Malibu Auto", "Coast 4x4", 2022, "420", "Câmbio manual", "Flex", 4, 2, "300 L", "SUV",
						"coast-4x4-lilas.jpg", "coast-4x4-azul.png"),
				modelo("Malibu Auto", "Speedster Z", 2024, "630", "Câmbio automático", "Híbrido", 2, 2, "300 L",
						"Conversível", "speedster-z-pink.png", "speedster-z-azul.png"),
				modelo("Heritage Pink", "Sweet 57", 1957, "2300", "Câmbio manual", "Flex", 2, 2, "300 L", "Clássico",
						"sweet-57-rosa.png", "sweet-57-turquesa.png"),
				modelo("Heritage Pink", "Bel-Star Cruiser", 1959, "1500", "Câmbio manual", "Flex", 5, 2, "300 L",
						"Clássico", "bel-star-cruiser-turquesa.png", "bel-star-cruiser-amarelo.png"),
				modelo("Malibu Auto", "Expedition Glam", 2012, "350", "Câmbio automático", "Flex", 7, 4, "500 L", "SUV",
						"expedition-glam-rosa.png", "expedition-glam-menta.png"),
				modelo("DreamMotors", "Baby Beetle", 2008, "180", "Câmbio manual", "Flex", 4, 2, "300 L", "Hatch",
						"baby-beetle-azul.png", "baby-beetle-lavanda.png"),
				modelo("DreamMotors", "Grand Vista", 2025, "1200", "Câmbio automático", "Híbrido", 5, 4, "650 L", "SUV",
						"grand-vista-perola.jpg", "grand-vista-menta.jpg"),
				modelo("Malibu Auto", "Ranch Pickup", 2020, "320", "Câmbio manual", "Flex", 2, 2, "900 L", "Picape",
						"ranch-pickup-lilas.jpg", "ranch-pickup-azul.webp"),
				modelo("DreamMotors", "Aurora Roadster", 2025, "1800", "Câmbio automático", "Elétrico", 2, 2, "150 L",
						"Conversível", "aurora-roadster-coral.jpg", "aurora-roadster-aqua.jpg"),
				modelo("Heritage Pink", "Bloom Mini", 2023, "190", "Câmbio automático", "Flex", 4, 2, "185 L", "Hatch",
						"bloom-mini-rosa.jpg", "bloom-mini-azul.jpg"),
				modelo("Malibu Auto", "Petal Sport", 2023, "230", "Câmbio manual", "Flex", 5, 4, "300 L", "Hatch",
						"petal-sport-coral.jpg", "petal-sport-menta.jpg"));
	}

	/** `fotos` são arquivos de `src/main/resources/imagens/carros`; a API monta a URL pública (veja ImagensConfig). */
	private static Modelo modelo(String marca, String nome, int ano, String diaria, String cambio, String combustivel,
			int assentos, int portas, String portaMalas, String carroceria, String... fotos) {
		List<String> caminhos = Arrays.stream(fotos).map(f -> "carros/" + f).toList();
		return Modelo.builder().marca(marca).nome(nome).ano(ano).diaria(new BigDecimal(diaria)).cambio(cambio)
				.combustivel(combustivel).assentos(assentos).portas(portas).seguro("Incluso").portaMalas(portaMalas)
				.carroceria(carroceria).imagemUrl(caminhos.getFirst()).fotos(new ArrayList<>(caminhos)).build();
	}

	private static final int AUTOMOVEIS_POR_MODELO = 4;

	/**
	 * Os automóveis do modelo na posição `i` do catálogo: duas lojas, com dois carros em cada, para a busca por loja
	 * ter o que filtrar e um aluguel não esgotar o modelo na loja.
	 */
	private static List<Automovel> frota(int i, Modelo modelo, List<Local> locais) {
		List<Automovel> frota = new ArrayList<>();
		for (int j = 0; j < 2; j++) {
			Local local = locais.get((i + j * 2) % locais.size());
			for (int k = 0; k < 2; k++) {
				int n = 1001 + i * AUTOMOVEIS_POR_MODELO + j * 2 + k;
				frota.add(new Automovel("MAT-" + n, String.format("PNK-%dG%02d", n % 10, n % 100), modelo, local));
			}
		}
		return frota;
	}
}
