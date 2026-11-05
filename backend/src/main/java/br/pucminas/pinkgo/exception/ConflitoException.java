package br.pucminas.pinkgo.exception;

public class ConflitoException extends RegraDeNegocioException {

	public ConflitoException(String campo, String mensagem) {
		super(campo, mensagem);
	}
}
