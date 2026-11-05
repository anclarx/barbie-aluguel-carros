package br.pucminas.pinkgo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import br.pucminas.pinkgo.dto.PedidoEdicaoRequest;
import br.pucminas.pinkgo.dto.PedidoRequest;
import br.pucminas.pinkgo.dto.PedidoResponse;
import br.pucminas.pinkgo.dto.PropostaRequest;
import br.pucminas.pinkgo.entity.Automovel;
import br.pucminas.pinkgo.entity.Banco;
import br.pucminas.pinkgo.entity.Cliente;
import br.pucminas.pinkgo.entity.Local;
import br.pucminas.pinkgo.entity.Modelo;
import br.pucminas.pinkgo.entity.Pedido;
import br.pucminas.pinkgo.entity.StatusPedido;
import br.pucminas.pinkgo.entity.StatusProposta;
import br.pucminas.pinkgo.entity.TipoContrato;
import br.pucminas.pinkgo.exception.RecursoNaoEncontradoException;
import br.pucminas.pinkgo.exception.RegraDeNegocioException;
import br.pucminas.pinkgo.repository.AutomovelRepository;
import br.pucminas.pinkgo.repository.BancoRepository;
import br.pucminas.pinkgo.repository.ClienteRepository;
import br.pucminas.pinkgo.repository.LocalRepository;
import br.pucminas.pinkgo.repository.ModeloRepository;
import br.pucminas.pinkgo.repository.PedidoRepository;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

	/** "Hoje" fixo: 12/01/2027, então a primeira retirada aceita é 13/01. */
	private static final LocalDate HOJE = LocalDate.of(2027, 1, 12);

	@Mock
	PedidoRepository pedidoRepository;
	@Mock
	ClienteRepository clienteRepository;
	@Mock
	ModeloRepository modeloRepository;
	@Mock
	AutomovelRepository automovelRepository;
	@Mock
	LocalRepository localRepository;
	@Mock
	BancoRepository bancoRepository;

	PedidoService service;
	Cliente cliente;
	Local bh;
	Automovel automovel;

	@BeforeEach
	void setUp() {
		Clock clock = Clock.fixed(HOJE.atStartOfDay(ZoneId.of("America/Sao_Paulo")).toInstant(),
				ZoneId.of("America/Sao_Paulo"));
		service = new PedidoService(pedidoRepository, clienteRepository, modeloRepository, automovelRepository,
				localRepository, bancoRepository, clock);

		cliente = new Cliente("Ana", "52998224725", "MG-1", "Rua A", "Designer", "ana@x.com", "hash");
		ReflectionTestUtils.setField(cliente, "id", 1L);
		bh = new Local("Savassi", "Belo Horizonte", "MG");
		ReflectionTestUtils.setField(bh, "id", 1L);
		Modelo modelo = Modelo.builder().id(10L).marca("DreamMotors").nome("Pegasus Cabrio").ano(2024)
				.diaria(new BigDecimal("1000.00")).imagemUrl("/x.png").build();
		automovel = new Automovel("MAT-1", "PNK-0001", modelo, bh);
	}

	private PedidoRequest pedido(LocalDate retirada, LocalDate entrega) {
		return new PedidoRequest(10L, 1L, null, retirada, entrega, false, null);
	}

	private void comAutomovelLivre() {
		when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
		when(modeloRepository.existsById(10L)).thenReturn(true);
		when(localRepository.findById(1L)).thenReturn(Optional.of(bh));
		when(automovelRepository.travarDoModeloNoLocal(10L, 1L)).thenReturn(List.of(automovel));
		// lenient: nos testes de validação o pedido é recusado antes de ser salvo.
		lenient().when(pedidoRepository.save(any(Pedido.class))).thenAnswer(i -> i.getArgument(0));
	}

	@Test
	void criarCalculaTotalPelasDiariasEReservaOAutomovel() {
		comAutomovelLivre();

		PedidoResponse criado = service.criar(1L, pedido(HOJE.plusDays(1), HOJE.plusDays(5)));

		assertThat(criado.totalEstimado()).isEqualByComparingTo("4000.00");
		assertThat(criado.status()).isEqualTo(StatusPedido.EM_ANALISE_FINANCEIRA);
		assertThat(criado.tipoContrato()).isEqualTo(TipoContrato.PROPRIEDADE_EMPRESA);
		assertThat(criado.automovel().placa()).isEqualTo("PNK-0001");
		assertThat(criado.localDevolucao().cidade()).isEqualTo("Belo Horizonte");
	}

	@Test
	void retiradaPrecisaSerAPartirDeAmanha() {
		assertThatThrownBy(() -> service.criar(1L, pedido(HOJE, HOJE.plusDays(3))))
				.isInstanceOf(RegraDeNegocioException.class)
				.extracting("campo").isEqualTo("dataRetirada");
	}

	@Test
	void entregaPrecisaSerPeloMenosUmDiaDepoisDaRetirada() {
		assertThatThrownBy(() -> service.criar(1L, pedido(HOJE.plusDays(2), HOJE.plusDays(2))))
				.isInstanceOf(RegraDeNegocioException.class)
				.extracting("campo").isEqualTo("dataEntrega");
	}

	@Test
	void semAutomovelLivreNoPeriodoNaoCriaPedido() {
		when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
		when(modeloRepository.existsById(10L)).thenReturn(true);
		when(localRepository.findById(1L)).thenReturn(Optional.of(bh));
		when(automovelRepository.travarDoModeloNoLocal(10L, 1L)).thenReturn(List.of(automovel));
		when(pedidoRepository.automovelOcupado(any(), any(), any(), any())).thenReturn(true);

		assertThatThrownBy(() -> service.criar(1L, pedido(HOJE.plusDays(1), HOJE.plusDays(2))))
				.isInstanceOf(RegraDeNegocioException.class)
				.hasMessageContaining("Belo Horizonte - MG · Savassi");
	}

	@Test
	void editarPedidoAprovadoRecalculaTotalEVoltaParaAnalise() {
		Pedido pedido = pedidoExistente();
		ReflectionTestUtils.setField(pedido, "status", StatusPedido.APROVADO);
		comBanco();

		PedidoResponse editado = service.editar(1L, 5L, edicao(HOJE.plusDays(11), true, new PropostaRequest(7L, 18)));

		assertThat(editado.totalEstimado()).isEqualByComparingTo("10000.00");
		assertThat(editado.status()).isEqualTo(StatusPedido.EM_ANALISE_FINANCEIRA);
		assertThat(editado.tipoContrato()).isEqualTo(TipoContrato.PROPRIEDADE_BANCO);
	}

	@Test
	void comCreditoCriaUmaPropostaPorBancoComASimulacao() {
		comAutomovelLivre();
		comBanco();

		PedidoResponse criado = service.criar(1L, new PedidoRequest(10L, 1L, null, HOJE.plusDays(1), HOJE.plusDays(23),
				true, List.of(new PropostaRequest(7L, 18))));

		assertThat(criado.propostas()).singleElement().satisfies(p -> {
			assertThat(p.status()).isEqualTo(StatusProposta.EM_ANALISE);
			assertThat(p.simulacao().valorParcela()).isEqualByComparingTo("1262.22");
			assertThat(p.simulacao().totalComFinanciamento()).isEqualByComparingTo("24919.96");
		});
	}

	@Test
	void comCreditoExigePeloMenosUmBanco() {
		comAutomovelLivre();

		assertThatThrownBy(() -> service.criar(1L,
				new PedidoRequest(10L, 1L, null, HOJE.plusDays(1), HOJE.plusDays(3), true, List.of())))
				.isInstanceOf(RegraDeNegocioException.class)
				.extracting("campo").isEqualTo("propostas");
	}

	@Test
	void parcelamentoPrecisaSerUmaOpcaoDoBanco() {
		comAutomovelLivre();
		comBanco();

		assertThatThrownBy(() -> service.criar(1L, new PedidoRequest(10L, 1L, null, HOJE.plusDays(1), HOJE.plusDays(3),
				true, List.of(new PropostaRequest(7L, 24)))))
				.isInstanceOf(RegraDeNegocioException.class)
				.hasMessageContaining("[6x, 12x, 18x]");
	}

	@Test
	void editarSemMudarOTotalMantemOStatusDoBancoQueNaoMudou() {
		Pedido pedido = pedidoExistente();
		comBanco();
		ReflectionTestUtils.setField(pedido, "comCredito", true);
		pedido.definirPropostas(java.util.Map.of(aurora, 12));
		ReflectionTestUtils.setField(pedido.getPropostas().getFirst(), "status", StatusProposta.APROVADA);

		PedidoResponse editado = service.editar(1L, 5L, edicao(HOJE.plusDays(3), true, new PropostaRequest(7L, 12)));
		assertThat(editado.propostas().getFirst().status()).isEqualTo(StatusProposta.APROVADA);

		// Outro parcelamento é outra proposta: volta para análise.
		editado = service.editar(1L, 5L, edicao(HOJE.plusDays(3), true, new PropostaRequest(7L, 18)));
		assertThat(editado.propostas().getFirst().status()).isEqualTo(StatusProposta.EM_ANALISE);
	}

	@Test
	void trocarALojaDeRetiradaTrocaOAutomovel() {
		pedidoExistente();
		Local sp = new Local("Pinheiros", "São Paulo", "SP");
		ReflectionTestUtils.setField(sp, "id", 2L);
		Automovel deSp = new Automovel("MAT-2", "PNK-0002", automovel.getModelo(), sp);
		when(localRepository.findById(2L)).thenReturn(Optional.of(sp));
		when(automovelRepository.travarDoModeloNoLocal(10L, 2L)).thenReturn(List.of(deSp));

		PedidoResponse editado = service.editar(1L, 5L,
				new PedidoEdicaoRequest(2L, null, HOJE.plusDays(1), HOJE.plusDays(3), false, null));

		assertThat(editado.automovel().placa()).isEqualTo("PNK-0002");
		assertThat(editado.localRetirada().cidade()).isEqualTo("São Paulo");
	}

	private Banco aurora;

	private void comBanco() {
		aurora = new Banco("Banco Aurora", new BigDecimal("1.49"), 18, new BigDecimal("10"));
		ReflectionTestUtils.setField(aurora, "id", 7L);
		when(bancoRepository.findById(7L)).thenReturn(Optional.of(aurora));
	}

	private static PedidoEdicaoRequest edicao(LocalDate entrega, boolean comCredito, PropostaRequest proposta) {
		return new PedidoEdicaoRequest(null, null, HOJE.plusDays(1), entrega, comCredito, List.of(proposta));
	}

	@Test
	void cancelarMudaOStatus() {
		pedidoExistente();

		PedidoResponse cancelado = service.cancelar(1L, 5L);

		assertThat(cancelado.status()).isEqualTo(StatusPedido.CANCELADO);
	}

	@Test
	void pedidoCanceladoNaoPodeSerEditado() {
		Pedido pedido = pedidoExistente();
		pedido.cancelar();

		assertThatThrownBy(() -> service.editar(1L, 5L,
				new PedidoEdicaoRequest(null, null, HOJE.plusDays(1), HOJE.plusDays(2), false, null)))
				.isInstanceOf(RegraDeNegocioException.class);
	}

	@Test
	void pedidoDeOutroClienteResponseComoInexistente() {
		pedidoExistente();

		assertThatThrownBy(() -> service.cancelar(2L, 5L)).isInstanceOf(RecursoNaoEncontradoException.class);
	}

	@Test
	void criarPulaOAutomovelOcupadoEFicaComOutroDaMesmaLoja() {
		comAutomovelLivre();
		Automovel outro = automovelComId("MAT-2", "PNK-0002", 2L);
		ReflectionTestUtils.setField(automovel, "id", 1L);
		when(automovelRepository.travarDoModeloNoLocal(10L, 1L)).thenReturn(List.of(automovel, outro));
		when(pedidoRepository.automovelOcupado(eq(1L), any(), any(), any())).thenReturn(true);

		PedidoResponse criado = service.criar(1L, pedido(HOJE.plusDays(1), HOJE.plusDays(3)));

		assertThat(criado.automovel().placa()).isEqualTo("PNK-0002");
	}

	@Test
	void devolucaoPodeSerEmQualquerLoja() {
		comAutomovelLivre();
		Local fortaleza = new Local("Aldeota", "Fortaleza", "CE");
		ReflectionTestUtils.setField(fortaleza, "id", 4L);
		when(localRepository.findById(4L)).thenReturn(Optional.of(fortaleza));

		PedidoResponse criado = service.criar(1L,
				new PedidoRequest(10L, 1L, 4L, HOJE.plusDays(1), HOJE.plusDays(3), false, null));

		assertThat(criado.localDevolucao().cidade()).isEqualTo("Fortaleza");
	}

	@Test
	void editarMantemOAutomovelAtualQuandoEleSegueLivre() {
		pedidoExistente();
		Automovel outro = automovelComId("MAT-2", "PNK-0002", 2L);
		// O outro vem primeiro na lista, mas o do pedido tem preferência.
		when(automovelRepository.travarDoModeloNoLocal(10L, 1L)).thenReturn(List.of(outro, automovel));

		PedidoResponse editado = service.editar(1L, 5L,
				new PedidoEdicaoRequest(null, null, HOJE.plusDays(2), HOJE.plusDays(6), false, null));

		assertThat(editado.automovel().placa()).isEqualTo("PNK-0001");
	}

	@Test
	void editarTrocaDeAutomovelQuandoOAtualFicaOcupadoNasNovasDatas() {
		pedidoExistente();
		ReflectionTestUtils.setField(automovel, "id", 1L);
		Automovel outro = automovelComId("MAT-2", "PNK-0002", 2L);
		when(automovelRepository.travarDoModeloNoLocal(10L, 1L)).thenReturn(List.of(automovel, outro));
		// Os dias do próprio pedido (id 5) não contam; outro pedido ocupa o carro atual nas novas datas.
		when(pedidoRepository.automovelOcupado(eq(1L), any(), any(), eq(5L))).thenReturn(true);

		PedidoResponse editado = service.editar(1L, 5L,
				new PedidoEdicaoRequest(null, null, HOJE.plusDays(8), HOJE.plusDays(10), false, null));

		assertThat(editado.automovel().placa()).isEqualTo("PNK-0002");
	}

	private Automovel automovelComId(String matricula, String placa, Long id) {
		Automovel a = new Automovel(matricula, placa, automovel.getModelo(), bh);
		ReflectionTestUtils.setField(a, "id", id);
		return a;
	}

	private Pedido pedidoExistente() {
		Pedido pedido = Pedido.criar(cliente, automovel, bh, bh, HOJE.plusDays(1), HOJE.plusDays(3), false, HOJE);
		ReflectionTestUtils.setField(pedido, "id", 5L);
		when(pedidoRepository.findById(5L)).thenReturn(Optional.of(pedido));
		// lenient: nem todo teste chega a conferir o automóvel (cancelar, pedido de outro cliente).
		lenient().when(automovelRepository.travarDoModeloNoLocal(10L, 1L)).thenReturn(List.of(automovel));
		return pedido;
	}
}
