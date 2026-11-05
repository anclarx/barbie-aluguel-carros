package br.pucminas.pinkgo.exception;

public class ServicoIndisponivelException extends RuntimeException {

	public ServicoIndisponivelException(String mensagem, Throwable causa) {
		super(mensagem, causa);
	}
}
