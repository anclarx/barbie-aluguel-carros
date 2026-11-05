package br.pucminas.pinkgo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Sem SMTP configurado (MAIL_HOST no .env), o "e-mail" é escrito no log do back-end: é lá que se copia o link de
 * redefinição de senha. Quem escolhe entre este e o EmailNotificacaoService é o NotificacaoConfig.
 */
public class LogNotificacaoService implements NotificacaoService {

	private static final Logger log = LoggerFactory.getLogger(LogNotificacaoService.class);

	@Override
	public void enviarLinkRedefinicaoSenha(String email, String nome, String link) {
		log.info("E-mail para {} <{}>: redefina sua senha em {}", nome, email, link);
	}
}
