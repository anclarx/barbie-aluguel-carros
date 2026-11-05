package br.pucminas.pinkgo.service;

/** Envio de mensagens para o cliente. Trocar a implementação (ex.: Spring Mail) não muda quem usa. */
public interface NotificacaoService {

	void enviarLinkRedefinicaoSenha(String email, String nome, String link);
}
