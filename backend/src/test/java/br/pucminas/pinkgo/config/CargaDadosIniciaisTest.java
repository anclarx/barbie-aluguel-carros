package br.pucminas.pinkgo.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import br.pucminas.pinkgo.entity.Cliente;
import br.pucminas.pinkgo.entity.Pedido;
import br.pucminas.pinkgo.entity.StatusPedido;
import br.pucminas.pinkgo.entity.StatusProposta;
import br.pucminas.pinkgo.entity.TipoContrato;
import br.pucminas.pinkgo.repository.AgenteRepository;
import br.pucminas.pinkgo.repository.ClienteRepository;
import br.pucminas.pinkgo.repository.PedidoRepository;

@SpringBootTest(properties = "pinkgo.bancos.analise-automatica=false")
@Transactional
class CargaDadosIniciaisTest {

	@Autowired
	CargaDadosIniciais carga;
	@Autowired
	ClienteRepository clienteRepository;
	@Autowired
	AgenteRepository agenteRepository;
	@Autowired
	PedidoRepository pedidoRepository;
	@Autowired
	PasswordEncoder passwordEncoder;

	private CargaDadosIniciais.Dados exemplo() throws IOException {
		return CargaDadosIniciais.ler(new ClassPathResource("dados-iniciais.exemplo.json")
				.getContentAsString(StandardCharsets.UTF_8));
	}

	@Test
	void carregaClienteComHistoricoEAgenteSemDuplicar() throws IOException {
		assertThat(carga.carregar(exemplo())).isEqualTo(1);

		Cliente cliente = clienteRepository.findByEmailIgnoreCase("cliente2@pinkgo.dev").orElseThrow();
		assertThat(passwordEncoder.matches("troque123", cliente.getSenha())).isTrue();
		assertThat(cliente.getCpf()).isEqualTo("11144477735");
		assertThat(agenteRepository.existsByEmailIgnoreCase("agente2@pinkgo.dev")).isTrue();

		List<Pedido> pedidos = pedidoRepository.findAll().stream()
				.filter(p -> p.getCliente().getId().equals(cliente.getId()))
				.sorted(Comparator.comparing(Pedido::getDataRetirada)).toList();
		assertThat(pedidos).extracting(Pedido::getStatus).containsExactly(StatusPedido.CONTRATO_ENCERRADO,
				StatusPedido.CANCELADO, StatusPedido.EM_ANALISE_FINANCEIRA);
		assertThat(pedidos.get(0).getTipoContrato()).isEqualTo(TipoContrato.PROPRIEDADE_EMPRESA);

		Pedido comCredito = pedidos.get(2);
		assertThat(comCredito.getBancoAssociado()).isEqualTo("Banco Aurora");
		assertThat(comCredito.getPropostas()).extracting(p -> p.getStatus())
				.containsExactlyInAnyOrder(StatusProposta.APROVADA, StatusProposta.NEGADA);
		assertThat(comCredito.pendenciaParaAprovar()).isEmpty();
		assertThat(comCredito.getLocalDevolucao().getBairro()).isEqualTo("Pinheiros");

		assertThat(carga.carregar(exemplo())).isZero();
	}

	@Test
	void arquivoDoProjetoCarregaTodosOsPedidos() throws IOException {
		var dados = CargaDadosIniciais.ler(new ClassPathResource("dados-iniciais.json")
				.getContentAsString(StandardCharsets.UTF_8));
		var novos = dados.clientes().stream().filter(c -> !clienteRepository.existsByEmailIgnoreCase(c.email())).toList();

		carga.carregar(dados);

		for (var c : novos) {
			Cliente cliente = clienteRepository.findByEmailIgnoreCase(c.email()).orElseThrow();
			long pedidos = pedidoRepository.findAll().stream()
					.filter(p -> p.getCliente().getId().equals(cliente.getId())).count();
			assertThat(pedidos).as(c.email()).isEqualTo(c.pedidos().size());
		}
	}

	@Test
	void pedidoComProblemaFicaDeForaSemPerderOCliente() {
		var dados = CargaDadosIniciais.ler("""
				{"clientes": [
				  {"nome": "Loja Ruim", "email": "loja.ruim@pinkgo.dev", "senha": "x12345678", "cpf": "390.533.447-05",
				   "rg": "MG-99.888.777", "endereco": "Rua B", "profissao": "Teste",
				   "rendimentos": [{"tipo": "INVESTIMENTO", "valorMensal": 100}],
				   "pedidos": [{"modelo": "Sweet 57", "lojaRetirada": "Lua", "retirada": "2026-01-01", "entrega": "2026-01-02"}]}
				]}
				""");

		assertThat(carga.carregar(dados)).isEqualTo(1);
		Cliente cliente = clienteRepository.findByEmailIgnoreCase("loja.ruim@pinkgo.dev").orElseThrow();
		assertThat(pedidoRepository.findAll()).noneMatch(p -> p.getCliente().getId().equals(cliente.getId()));
	}

	@Test
	@Transactional(propagation = Propagation.NOT_SUPPORTED)
	void clienteComCpfInvalidoNaoEntra() {
		var dados = CargaDadosIniciais.ler("""
				{"clientes": [
				  {"nome": "CPF Ruim", "email": "cpf.ruim@pinkgo.dev", "senha": "x12345678", "cpf": "123",
				   "rg": "1", "endereco": "Rua A", "profissao": "Teste",
				   "rendimentos": [{"tipo": "INVESTIMENTO", "valorMensal": 100}]}
				]}
				""");

		assertThat(carga.carregar(dados)).isZero();
		assertThat(clienteRepository.existsByEmailIgnoreCase("cpf.ruim@pinkgo.dev")).isFalse();
	}
}
