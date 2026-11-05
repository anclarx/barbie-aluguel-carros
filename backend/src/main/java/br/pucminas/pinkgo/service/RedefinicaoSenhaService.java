package br.pucminas.pinkgo.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucminas.pinkgo.entity.TokenRedefinicaoSenha;
import br.pucminas.pinkgo.exception.RegraDeNegocioException;
import br.pucminas.pinkgo.repository.ClienteRepository;
import br.pucminas.pinkgo.repository.TokenRedefinicaoSenhaRepository;

@Service
@Transactional
public class RedefinicaoSenhaService {

	static final Duration VALIDADE = Duration.ofMinutes(30);
	private static final int BYTES_TOKEN = 32;

	private final ClienteRepository clienteRepository;
	private final TokenRedefinicaoSenhaRepository tokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final NotificacaoService notificacao;
	private final Clock clock;
	private final String frontUrl;
	private final SecureRandom aleatorio = new SecureRandom();

	public RedefinicaoSenhaService(ClienteRepository clienteRepository, TokenRedefinicaoSenhaRepository tokenRepository,
			PasswordEncoder passwordEncoder, NotificacaoService notificacao, Clock clock,
			@Value("${pinkgo.front-url}") String frontUrl) {
		this.clienteRepository = clienteRepository;
		this.tokenRepository = tokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.notificacao = notificacao;
		this.clock = clock;
		this.frontUrl = frontUrl;
	}

	public void solicitar(String email) {
		clienteRepository.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT)).ifPresent(cliente -> {
			Instant agora = clock.instant();
			tokenRepository.invalidarDoCliente(cliente.getId(), agora);
			String token = novoToken();
			tokenRepository.save(new TokenRedefinicaoSenha(hash(token), cliente, agora.plus(VALIDADE)));
			notificacao.enviarLinkRedefinicaoSenha(cliente.getEmail(), cliente.getNome(),
					frontUrl + "/redefinir-senha?token=" + token);
		});
	}

	public void redefinir(String token, String novaSenha) {
		Instant agora = clock.instant();
		TokenRedefinicaoSenha registro = tokenRepository.findByTokenHash(hash(token))
				.filter(t -> t.valido(agora))
				.orElseThrow(() -> new RegraDeNegocioException("token",
						"Este link expirou ou já foi usado. Peça um novo em \"Esqueceu sua senha?\"."));
		registro.getCliente().setSenha(passwordEncoder.encode(novaSenha));
		registro.usar(agora);
	}

	private String novoToken() {
		byte[] bytes = new byte[BYTES_TOKEN];
		aleatorio.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	static String hash(String token) {
		try {
			byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(digest);
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException("SHA-256 indisponível", e);
		}
	}
}
