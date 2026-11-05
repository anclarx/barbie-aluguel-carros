package br.pucminas.pinkgo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.pucminas.pinkgo.dto.ClienteCadastroRequest;
import br.pucminas.pinkgo.dto.ClienteResponse;
import br.pucminas.pinkgo.dto.RendimentoRequest;
import br.pucminas.pinkgo.entity.Cliente;
import br.pucminas.pinkgo.entity.StatusPedido;
import br.pucminas.pinkgo.entity.TipoRendimento;
import br.pucminas.pinkgo.exception.ConflitoException;
import br.pucminas.pinkgo.exception.RegraDeNegocioException;
import br.pucminas.pinkgo.repository.AgenteRepository;
import br.pucminas.pinkgo.repository.ClienteRepository;
import br.pucminas.pinkgo.repository.PedidoRepository;
import br.pucminas.pinkgo.repository.TokenRedefinicaoSenhaRepository;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

	@Mock
	ClienteRepository clienteRepository;
	@Mock
	PedidoRepository pedidoRepository;
	@Mock
	AgenteRepository agenteRepository;
	@Mock
	TokenRedefinicaoSenhaRepository tokenRepository;
	@Mock
	PasswordEncoder passwordEncoder;

	ClienteService service;

	@BeforeEach
	void setUp() {
		service = new ClienteService(clienteRepository, pedidoRepository, agenteRepository, tokenRepository, passwordEncoder);
	}

	private static ClienteCadastroRequest cadastro(int rendimentos) {
		return new ClienteCadastroRequest("Ana", "529.982.247-25", "12.345.678-9", "Rua A", "Designer", " Ana@X.com ",
				"12345678", Collections.nCopies(rendimentos,
						new RendimentoRequest(TipoRendimento.OUTRO, "Freela", new BigDecimal("100"))));
	}

	@Test
	void cadastroGuardaSenhaComHashCpfSoComDigitosEEmailNormalizado() {
		when(passwordEncoder.encode("12345678")).thenReturn("hash");
		when(clienteRepository.save(any(Cliente.class))).thenAnswer(i -> i.getArgument(0));

		ClienteResponse criado = service.cadastrar(cadastro(2));

		assertThat(criado.cpf()).isEqualTo("52998224725");
		assertThat(criado.email()).isEqualTo("ana@x.com");
		assertThat(criado.rendimentos()).hasSize(2);
	}

	@Test
	void cpfRepetidoNaoCadastra() {
		when(clienteRepository.existsByCpf("52998224725")).thenReturn(true);

		assertThatThrownBy(() -> service.cadastrar(cadastro(1)))
				.isInstanceOf(ConflitoException.class)
				.extracting("campo").isEqualTo("cpf");
		verify(clienteRepository, never()).save(any());
	}

	@Test
	void maisDeTresRendimentosNaoCadastra() {
		when(passwordEncoder.encode(any())).thenReturn("hash");

		assertThatThrownBy(() -> service.cadastrar(cadastro(4)))
				.isInstanceOf(RegraDeNegocioException.class)
				.extracting("campo").isEqualTo("rendimentos");
	}

	@Test
	void naoExcluiContaComContratoEmExecucao() {
		Cliente cliente = new Cliente("Ana", "52998224725", "MG-1", "Rua A", "Designer", "ana@x.com", "hash");
		when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
		when(pedidoRepository.existsByClienteIdAndStatus(1L, StatusPedido.CONTRATO_EM_EXECUCAO)).thenReturn(true);

		assertThatThrownBy(() -> service.excluir(1L)).isInstanceOf(RegraDeNegocioException.class);
		verify(clienteRepository, never()).delete(any());
		verify(pedidoRepository, never()).deleteAll(List.of());
	}
}
