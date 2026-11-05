package br.pucminas.pinkgo.exception;

/** Dado que precisa ser único já existe, como CPF ou e-mail (HTTP 409). */
public class ConflitoException extends RegraDeNegocioException {

	public ConflitoException(String campo, String mensagem) {
		super(campo, mensagem);
	}
}
