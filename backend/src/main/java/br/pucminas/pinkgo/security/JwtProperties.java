package br.pucminas.pinkgo.security;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("pinkgo.jwt")
public record JwtProperties(String secret, Duration expiracao) {

	private static final int TAMANHO_MINIMO = 32;

	public JwtProperties {
		if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < TAMANHO_MINIMO)
			throw new IllegalStateException("Defina JWT_SECRET com pelo menos " + TAMANHO_MINIMO + " caracteres.");
		if (expiracao == null) expiracao = Duration.ofHours(8);
	}
}
