package br.pucminas.pinkgo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LogNotificacaoService implements NotificacaoService {

	private static final Logger log = LoggerFactory.getLogger(LogNotificacaoService.class);

	@Override
	public void enviarLinkRedefinicaoSenha(String email, String nome, String link) {
		log.info("E-mail para {} <{}>: redefina sua senha em {}", nome, email, link);
	}
}
