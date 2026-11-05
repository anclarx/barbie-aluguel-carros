package br.pucminas.pinkgo.exception;

/** Regra do domínio violada (HTTP 422). `campo` liga o erro a um campo do formulário, quando faz sentido. */
public class RegraDeNegocioException extends RuntimeException {

	private final String campo;

	public RegraDeNegocioException(String mensagem) {
		this(null, mensagem);
	}

	public RegraDeNegocioException(String campo, String mensagem) {
		super(mensagem);
		this.campo = campo;
	}

	public String getCampo() {
		return campo;
	}
}
