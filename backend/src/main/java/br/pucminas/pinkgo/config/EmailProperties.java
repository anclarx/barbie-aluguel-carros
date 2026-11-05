package br.pucminas.pinkgo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** `pinkgo.email.*` do application.yml: o SMTP que envia o e-mail de "esqueci a senha". */
@ConfigurationProperties("pinkgo.email")
public record EmailProperties(String host, int port, String usuario, String senha, String remetente) {

	/** Sem servidor configurado, as mensagens só vão para o log. */
	public boolean configurado() {
		return host != null && !host.isBlank();
	}
}
