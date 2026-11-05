package br.pucminas.pinkgo.service;

public interface NotificacaoService {

	void enviarLinkRedefinicaoSenha(String email, String nome, String link);
}
