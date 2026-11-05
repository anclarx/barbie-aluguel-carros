package br.pucminas.pinkgo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("pinkgo.email")
public record EmailProperties(String host, int port, String usuario, String senha, String remetente) {

	public boolean configurado() {
		return host != null && !host.isBlank();
	}
}
