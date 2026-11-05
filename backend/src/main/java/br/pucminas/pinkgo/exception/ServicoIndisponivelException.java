package br.pucminas.pinkgo.exception;

/** Um serviço externo (ex.: busca de endereços) não respondeu (HTTP 503). */
public class ServicoIndisponivelException extends RuntimeException {

	public ServicoIndisponivelException(String mensagem, Throwable causa) {
		super(mensagem, causa);
	}
}
