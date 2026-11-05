package br.pucminas.pinkgo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import br.pucminas.pinkgo.entity.Cliente;
import br.pucminas.pinkgo.entity.TokenRedefinicaoSenha;
import br.pucminas.pinkgo.exception.RegraDeNegocioException;
import br.pucminas.pinkgo.repository.ClienteRepository;
import br.pucminas.pinkgo.repository.TokenRedefinicaoSenhaRepository;

@ExtendWith(MockitoExtension.class)
class RedefinicaoSenhaServiceTest {

	private static final Instant AGORA = Instant.parse("2027-01-12T15:00:00Z");

	@Mock
	ClienteRepository clienteRepository;
	@Mock
	TokenRedefinicaoSenhaRepository tokenRepository;
	@Mock
	PasswordEncoder passwordEncoder;
	@Mock
	NotificacaoService notificacao;

	RedefinicaoSenhaService service;
	Cliente cliente;

	@BeforeEach
	void setUp() {
		service = new RedefinicaoSenhaService(clienteRepository, tokenRepository, passwordEncoder, notificacao,
				Clock.fixed(AGORA, ZoneOffset.UTC), "http://localhost:5173");
		cliente = new Cliente("Ana", "52998224725", "123456789", "Rua A", "Designer", "ana@x.com", "hash-antigo");
		ReflectionTestUtils.setField(cliente, "id", 1L);
	}

	@Test
	void mandaUmLinkESalvaSoOHashDoToken() {
		when(clienteRepository.findByEmailIgnoreCase("ana@x.com")).thenReturn(Optional.of(cliente));

		service.solicitar(" Ana@X.com ");

		ArgumentCaptor<String> link = ArgumentCaptor.forClass(String.class);
		verify(notificacao).enviarLinkRedefinicaoSenha(any(), any(), link.capture());
		String token = link.getValue().substring(link.getValue().indexOf("token=") + 6);
		assertThat(link.getValue()).startsWith("http://localhost:5173/redefinir-senha?token=");

		ArgumentCaptor<TokenRedefinicaoSenha> salvo = ArgumentCaptor.forClass(TokenRedefinicaoSenha.class);
		verify(tokenRepository).save(salvo.capture());
		assertThat(salvo.getValue().getTokenHash()).isEqualTo(RedefinicaoSenhaService.hash(token)).isNotEqualTo(token);
		assertThat(salvo.getValue().getExpiraEm()).isEqualTo(AGORA.plus(RedefinicaoSenhaService.VALIDADE));
		verify(tokenRepository).invalidarDoCliente(1L, AGORA);
	}

	@Test
	void emailSemContaNaoMandaNadaENemAvisa() {
		when(clienteRepository.findByEmailIgnoreCase("nao@existe.com")).thenReturn(Optional.empty());

		service.solicitar("nao@existe.com");

		verify(notificacao, never()).enviarLinkRedefinicaoSenha(anyString(), anyString(), anyString());
	}

	@Test
	void linkValidoTrocaASenhaUmaVezSo() {
		TokenRedefinicaoSenha registro = new TokenRedefinicaoSenha(RedefinicaoSenhaService.hash("abc"), cliente,
				AGORA.plusSeconds(60));
		when(tokenRepository.findByTokenHash(RedefinicaoSenhaService.hash("abc"))).thenReturn(Optional.of(registro));
		when(passwordEncoder.encode("novaSenha1")).thenReturn("hash-novo");

		service.redefinir("abc", "novaSenha1");

		assertThat(cliente.getSenha()).isEqualTo("hash-novo");
		assertThatThrownBy(() -> service.redefinir("abc", "outraSenha2")).isInstanceOf(RegraDeNegocioException.class);
	}

	@Test
	void linkVencidoNaoTrocaASenha() {
		TokenRedefinicaoSenha vencido = new TokenRedefinicaoSenha(RedefinicaoSenhaService.hash("abc"), cliente,
				AGORA.minusSeconds(1));
		when(tokenRepository.findByTokenHash(RedefinicaoSenhaService.hash("abc"))).thenReturn(Optional.of(vencido));

		assertThatThrownBy(() -> service.redefinir("abc", "novaSenha1")).isInstanceOf(RegraDeNegocioException.class);
		assertThat(cliente.getSenha()).isEqualTo("hash-antigo");
	}
}
